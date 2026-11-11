# Tasks - Phantom Studio MVP

Status: spec approved. Implementation has NOT started. Each task cites the
requirement(s) it satisfies and ends with a verification criterion. Do tasks
in order; do not skip verification.

## 1. Project skeleton and Kiro wiring [REQ-11, REQ-12]

- Create this repository with `README.md`, `LICENSE`, `.gitignore` (with NO
  `.kiro` entry), `package.json`, `.kiro/steering/`, `.kiro/specs/`,
  `.kiro/hooks/`, `.kiro/settings/mcp.json`, and vendored `lib/` files.
- Verify: `node --check` passes on every `.js` file; `.gitignore` contains no
  `.kiro` line; the file tree shows `.kiro/` at the repo root.

## 2. Subtitle chunker + property-based tests [REQ-5, REQ-2]

- Implement `src/subtitles.js`: chunker (3-6 words, max 2 lines, exact word
  preservation), keyword selection (longest content word, never a stop-word),
  layout function returning the subtitle box (centered, bottom <= H - 400),
  and the title-card rule (no subtitle for t < 2.5s).
- Add `fast-check` as a devDependency and write property tests for the
  chunker, the safe-zone layout, and the title-card rule (see `design.md`).
- Verify: `npm test` passes, including at least 100 property-test runs per
  property with zero failures; a manual spot-check of 3 scripts shows no lost
  or reordered words.

## 3. Script parser and storyboard splitter [REQ-1]

- Implement `src/script.js`: split user input into exactly 3 scenes, each
  with narration text and visual direction (pose key, camera shot, background).
- Show the storyboard in the UI for review before any rendering starts.
- Verify: 5 sample scripts (short, long, single-sentence, with/without
  punctuation) each produce exactly 3 non-empty scenes; narration text of the
  3 scenes concatenated equals the input script.

## 4. Stickman scene renderer [REQ-3, REQ-9]

- Implement `src/scenes.js` (per-scene staging) and `src/render.js`
  (`draw(ctx, t, W, H, scene)` as a pure function of `t`).
- Load the vendored CommonJS libs (`lib/stickman.js`, `lib/camera.js`,
  `lib/fx.js`) via a small shim/ESM wrapper; do NOT modify the vendored files.
- Verify: preview renders 1080x1920 at 30fps in Chrome; 3 screenshots
  (start/middle/end) inspected by eye; `draw` called twice with the same `t`
  produces pixel-identical output (determinism check).

## 5. Voice provider [REQ-4, REQ-9]

- Implement `src/voice.js`: `VoiceProvider` interface plus the Web Speech API
  provider; expose total voice duration and a per-word timing estimate.
- Handle the unavailable-provider case with a clear error and no silent render.
- Verify: a 60-word script produces a voice track whose measured duration
  matches the reported duration within 0.5s; total video duration equals
  voice duration + 2.5s.

## 6. Music engine and ducking [REQ-6]

- Implement `src/music.js`: procedural WebAudio bed plus gain automation that
  ducks music during voiced segments and restores it during pauses.
- Verify: with voice playing, music is audibly lower than during pauses
  (measured via AnalyserNode: music-bus level drops by at least 6 dB while
  voiced); no clipping in the mixed output.

## 7. UI and preview [REQ-1, REQ-10]

- Implement `index.html` and `src/main.js`: script input, storyboard review,
  preview player (play/pause, scene scrub), and the state machine
  (idle -> storyboard -> voice -> preview -> export).
- Verify: the app works by opening `index.html` over a static server with no
  build step; every MVP feature is reachable from the UI with no console errors.

## 8. WebM export [REQ-7]

- Implement `src/export.js`: `canvas.captureStream(30)` + mixed audio into
  MediaRecorder (`video/webm`), download the resulting file.
- Verify: export a 30-45s video from a real script; `ffprobe` shows one video
  and one audio stream; duration matches voice + 2.5s within 0.1s; audio and
  video stay in sync by eye/ear on 3 spot-check frames.

## 9. MP4 via ffmpeg.wasm (stretch goal, optional) [REQ-8]

- Attempt the ffmpeg.wasm path only after Task 8 is verified. Measure load
  time, encode time, and peak memory on a 30s export.
- Verify: if MP4 completes, `ffprobe` confirms an H.264/AAC MP4; if it fails
  or is too slow, document the result, keep WebM as the shipped export, and
  mark this task as intentionally skipped in the submission. This task never
  blocks the MVP.

## 10. Demo video, write-up, and submission [REQ-11, REQ-12]

- Record the demo video (under 3 minutes, public on YouTube) showing the full
  flow on a real script; write the Devpost text description and the "how Kiro
  was used" write-up (specs, hooks, steering, MCP, property-based testing);
  publish the Bonus Blog post mentioning Kiroween 2026.
- Verify: the demo video plays end-to-end with no dead air; the submission
  lists the vendored `lib/` files as pre-existing code with a link to
  `lib/LIB_ORIGIN.md`; the repo is public with `/.kiro` at the root and a
  visible open-source license.
