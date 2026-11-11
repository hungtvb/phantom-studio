// stickman.js - vendored from Tony's local-video-pipeline skill.
// Origin: ~/workspace/custom-skills/local-video-pipeline/lib/stickman.js
// PRE-EXISTING CODE, reused with disclosure. This file was written before
// the Kiroween 2026 submission period (30 Oct - 4 Dec 2026) as part of Tony's
// code-driven video pipeline (Canvas 2D deterministic scenes). It is reused
// unchanged except for this header comment, and WILL BE DISCLOSED in the
// Devpost submission, as required by the Kiroween 2026 Official Rules
// ("must disclose any other pre-existing code or work incorporated into
// the Project").
// License: same as this repository (MIT, Copyright (c) 2026 Hung Tran).
//
// stickman.js — procedural stick-figure rig. Pure functions of t (deterministic).
//
// Side-view skeleton. Units: 1 = character height. facing: 1 = faces right, -1 = faces left.
// Pose: {
//   torso, head,                 // torso lean fwd (+), head tilt; radians, 0 = upright
//   armL: {sh, el}, armR: {sh, el},  // sh: upper-arm from hanging-down, + = swing forward
//   legL: {hip, knee}, legR: {hip, knee}, // hip: thigh from straight-down; knee: bend (+ = heel back)
//   crouch,                      // hips lower, in height units
//   bodyRot,                     // whole-body rotation (knockback), radians, + = forward
//   dx, dy,                      // body offset in px (+x fwd, +y down)
// }
//
// Usage:
//   const sm = M.lib.stickman;
//   const p = sm.keyPose([ {t:0, pose: sm.POSE.stance()}, {t:0.5, pose: sm.POSE.punch()}, ], t);
//   sm.draw(ctx, { x, y, h, facing, pose: p, color: '#fff', glow: '#4fc3f7', width: 0.05 });

function lerp(a, b, k) { return a + (b - a) * k; }
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

const EASE = {
  linear: k => k,
  inOut: k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2,
  out: k => 1 - Math.pow(1 - k, 3),
  in: k => k * k * k,
  snap: k => k < 1 ? 0 : 1, // for hit-stop style pops (use with keyPose)
};

const SEG = { thigh: 0.27, shin: 0.25, torso: 0.30, neck: 0.05, headR: 0.095, upper: 0.19, fore: 0.18 };

// ---- base poses (facing right) ----
function base(over) {
  return Object.assign({
    torso: 0.15, head: 0,
    armL: { sh: 0.7, el: 1.4 }, armR: { sh: 0.9, el: 1.5 },
    legL: { hip: 0.22, knee: 0.3 }, legR: { hip: -0.18, knee: 0.25 },
    crouch: 0.05, bodyRot: 0, dx: 0, dy: 0,
  }, over || {});
}
const POSE = {
  stance: () => base(),
  idle: () => base({ torso: 0.05, armL: { sh: 0.3, el: 0.5 }, armR: { sh: 0.35, el: 0.55 },
    legL: { hip: 0.08, knee: 0.08 }, legR: { hip: -0.08, knee: 0.08 }, crouch: 0.02 }),
  // punch windup: right arm cocked back
  windup: () => base({ torso: 0.3, armR: { sh: -0.5, el: 1.9 }, armL: { sh: 1.0, el: 1.2 },
    legL: { hip: 0.35, knee: 0.45 }, legR: { hip: -0.3, knee: 0.35 }, crouch: 0.09 }),
  // straight punch extended
  punch: () => base({ torso: 0.42, armR: { sh: 1.62, el: 0.08 }, armL: { sh: 0.4, el: 1.8 },
    legL: { hip: 0.42, knee: 0.2 }, legR: { hip: -0.38, knee: 0.5 }, crouch: 0.1 }),
  // uppercut: right arm low->up
  uppercut: () => base({ torso: 0.32, head: -0.15, armR: { sh: 2.4, el: 0.5 }, armL: { sh: 0.2, el: 1.9 },
    legL: { hip: 0.3, knee: 0.55 }, legR: { hip: -0.25, knee: 0.4 }, crouch: 0.12 }),
  // dodge: lean back hard
  dodge: () => base({ torso: -0.55, head: -0.3, armL: { sh: -0.4, el: 0.6 }, armR: { sh: -0.5, el: 0.7 },
    legL: { hip: 0.15, knee: 0.5 }, legR: { hip: -0.35, knee: 0.55 }, crouch: 0.14 }),
  // hit reaction: thrown back
  hit: () => base({ torso: -0.5, head: -0.45, armL: { sh: -1.2, el: 0.4 }, armR: { sh: -1.0, el: 0.5 },
    legL: { hip: 0.5, knee: 0.9 }, legR: { hip: -0.1, knee: 0.7 }, crouch: 0.02, bodyRot: -0.5 }),
  // lying on ground (KO)
  down: () => base({ torso: 1.45, head: 0.2, armL: { sh: 0.4, el: 0.3 }, armR: { sh: -0.6, el: 0.4 },
    legL: { hip: 0.15, knee: 0.15 }, legR: { hip: -0.1, knee: 0.2 }, crouch: 0, bodyRot: -1.5, dy: 0 }),
};

// deep lerp between poses
function lerpPose(a, b, k) {
  const o = {};
  for (const key of Object.keys(a)) {
    if (typeof a[key] === 'object') {
      o[key] = {};
      for (const s of Object.keys(a[key])) o[key][s] = lerp(a[key][s], b[key][s], k);
    } else o[key] = lerp(a[key], b[key], k);
  }
  return o;
}

// keys: [{t, pose, ease}] — pose timeline; holds first/last outside range
function keyPose(keys, t) {
  const ks = keys.slice().sort((x, y) => x.t - y.t);
  if (t <= ks[0].t) return ks[0].pose;
  for (let i = 0; i < ks.length - 1; i++) {
    if (t >= ks[i].t && t < ks[i + 1].t) {
      const e = EASE[ks[i + 1].ease] || EASE.inOut;
      const k = e((t - ks[i].t) / (ks[i + 1].t - ks[i].t));
      return lerpPose(ks[i].pose, ks[i + 1].pose, k);
    }
  }
  return ks[ks.length - 1].pose;
}

// procedural walk cycle; speed = strides/sec. Returns pose (call per frame).
function walk(t, o) {
  o = o || {};
  const f = (o.freq || 2.2) * Math.PI * 2, a = o.amp || 0.5;
  const s1 = Math.sin(t * f), s2 = Math.sin(t * f + Math.PI);
  return base({
    torso: 0.22, head: 0,
    legL: { hip: s1 * a, knee: Math.max(0, -s2) * a * 1.4 + 0.08 },
    legR: { hip: s2 * a, knee: Math.max(0, -s1) * a * 1.4 + 0.08 },
    armL: { sh: s2 * a * 0.7, el: 0.5 }, armR: { sh: s1 * a * 0.7, el: 0.5 },
    crouch: 0.07 + 0.02 * Math.abs(Math.cos(t * f)),
  });
}

// ---- forward kinematics: pose -> joint positions (unit space, hips at 0,0, +x fwd, +y down)
function fk(p) {
  const hy = p.crouch;
  const sh = { x: Math.sin(p.torso) * SEG.torso, y: hy - Math.cos(p.torso) * SEG.torso };
  const head = {
    x: sh.x + Math.sin(p.torso + p.head) * (SEG.neck + SEG.headR),
    y: sh.y - Math.cos(p.torso + p.head) * (SEG.neck + SEG.headR),
  };
  const arm = (a) => {
    const el = { x: sh.x + Math.sin(a.sh) * SEG.upper, y: sh.y + Math.cos(a.sh) * SEG.upper };
    const hand = { x: el.x + Math.sin(a.sh + a.el) * SEG.fore, y: el.y + Math.cos(a.sh + a.el) * SEG.fore };
    return { el, hand };
  };
  const leg = (l) => {
    const knee = { x: Math.sin(l.hip) * SEG.thigh, y: hy + Math.cos(l.hip) * SEG.thigh };
    const foot = { x: knee.x + Math.sin(l.hip + l.knee) * SEG.shin, y: knee.y + Math.cos(l.hip + l.knee) * SEG.shin };
    return { knee, foot };
  };
  return { hips: { x: 0, y: hy }, sh, head, armL: arm(p.armL), armR: arm(p.armR), legL: leg(p.legL), legR: leg(p.legR) };
}

// draw. o: {x, y (ground px), h (px height), facing, pose, color, glow, width (fraction of h),
//   t (seconds, for animated gear), headband (color|null), belt (color|null)}
function draw(ctx, o) {
  const p = o.pose, h = o.h, fx = o.facing || 1;
  const j = fk(p);
  // NOTE: rotation is applied in LOCAL space (facing-right); the x-mirror below handles facing.
  // Do NOT multiply bodyRot by facing here — that double-applies it and flips knockbacks.
  const rot = p.bodyRot || 0;
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const P = (pt) => {
    // rotate around hips, mirror for facing, scale, translate (+dx,dy)
    const rx = pt.x * cos - pt.y * sin, ry = pt.x * sin + pt.y * cos;
    return { x: o.x + (rx * fx) * h + (p.dx || 0), y: o.y + ry * h + (p.dy || 0) };
  };
  const H = P(j.head), S = P(j.sh), Hp = P(j.hips);
  const aL = { e: P(j.armL.el), h: P(j.armL.hand) }, aR = { e: P(j.armR.el), h: P(j.armR.hand) };
  const lL = { k: P(j.legL.knee), f: P(j.legL.foot) }, lR = { k: P(j.legR.knee), f: P(j.legR.foot) };

  ctx.save();
  ctx.strokeStyle = o.color || '#fff';
  ctx.lineWidth = (o.width || 0.05) * h;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = h * 0.12; }
  const seg = (a, b) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
  // back limbs first
  seg(Hp, lL.k); seg(lL.k, lL.f);
  seg(S, aL.e); seg(aL.e, aL.h);
  // torso + head
  seg(Hp, S);
  ctx.beginPath(); ctx.arc(H.x, H.y, SEG.headR * h, 0, Math.PI * 2); ctx.stroke();
  // front limbs
  seg(S, aR.e); seg(aR.e, aR.h);
  seg(Hp, lR.k); seg(lR.k, lR.f);
  // ---- gear: belt + headband (character design) ----
  const t = o.t || 0;
  if (o.belt) {
    ctx.strokeStyle = o.belt; ctx.lineWidth = (o.width || 0.05) * h * 1.15;
    const bw = 0.16 * h * fx;
    ctx.beginPath(); ctx.moveTo(Hp.x - bw / 2, Hp.y); ctx.lineTo(Hp.x + bw / 2, Hp.y); ctx.stroke();
  }
  if (o.headband) {
    ctx.strokeStyle = o.headband; ctx.lineWidth = (o.width || 0.05) * h * 0.8;
    const hr = SEG.headR * h;
    // band across head (perpendicular to facing)
    ctx.beginPath(); ctx.moveTo(H.x - hr * 0.9, H.y - hr * 0.15); ctx.lineTo(H.x + hr * 0.9, H.y - hr * 0.15); ctx.stroke();
    // two flowing tails behind (animated)
    ctx.lineWidth = (o.width || 0.05) * h * 0.55;
    for (let i = 0; i < 2; i++) {
      const wob = Math.sin(t * 9 + i * 2.1) * hr * 0.5;
      const bx = H.x - fx * hr * 0.8, by = H.y - hr * 0.15 + i * hr * 0.35;
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx - fx * hr * 1.6, by + wob, bx - fx * hr * (2.6 + i * 0.7), by + hr * 0.5 + wob * 1.4);
      ctx.stroke();
    }
  }
  ctx.restore();
}

module.exports = { POSE, base, lerpPose, keyPose, walk, fk, draw, EASE };
