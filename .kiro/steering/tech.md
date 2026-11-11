# Tech - Phantom Studio

## Stack (MVP)

- **Language:** Vanilla JavaScript (ES2022), no framework, no build step.
- **Rendering:** Canvas 2D, 1080x1920, `requestAnimationFrame` preview and
  `canvas.captureStream()` for export. Deterministic frames: every frame is a
  pure function of `t = N/fps`.
- **Voice:** Web Speech API (`speechSynthesis`) as the MVP default. A small
  provider interface (`VoiceProvider`) isolates it so a higher-quality TTS can
  be plugged in later without touching the render pipeline.
- **Music:** WebAudio API. Procedural bed (oscillator + gain envelopes) with
  ducking: music gain is automated down while the voice is speaking.
- **Subtitles:** DOM overlay for preview, drawn onto the canvas for export so
  the downloaded video has burned-in subtitles.
- **Export:** MediaRecorder with `video/webm` (Chrome/Edge). MP4 via
  ffmpeg.wasm is a stretch goal; see `design.md` for the decision and risks.
- **Tooling:** Node 18+ for checks only (`node --check`, `npm test`). No
  bundler for the MVP.

## Vendored libraries

`lib/stickman.js`, `lib/camera.js`, `lib/fx.js` are CommonJS modules vendored
from Tony's local-video-pipeline skill (see `lib/LIB_ORIGIN.md`). They are
pre-existing code, reused with disclosure. Integration note: they use
`module.exports`, so the browser code loads them through a tiny CommonJS shim
or an ESM wrapper written during implementation (Task 4). Their APIs
(`stickman.draw`, `camera.at`/`apply`, `fx.fade`/`pop`) are used as-is.

## Conventions

- **Audio first.** The voice track is produced and locked before video is
  rendered. Video duration equals voice duration (plus the 2.5s title card).
- **Pure functions of time.** Scene drawing code takes `(ctx, t, W, H)` and
  must not depend on wall-clock time or mutable global state.
- **Screen space vs world space.** World (character, background) is drawn
  inside the camera transform; HUD and subtitles are drawn outside it, in
  screen space.
- **Fail visibly.** If TTS, WebAudio, or MediaRecorder is unavailable, show a
  clear error message instead of a silent broken export.
- **No secrets in the repo.** No API keys are needed for the MVP. If a TTS
  provider key is added later, it must live in browser local storage, never in
  source.

## Testing

- `npm test` runs `node --check` on the vendored libs today; it grows into real
  unit + property-based tests as `src/` lands (see `design.md`, section on
  property-based testing).
- Property-based tests (planned, `fast-check`) cover the subtitle chunker and
  the safe-zone layout: chunks of at most 6 words, at most 2 lines, no words
  lost or reordered, subtitle box bottom at least 400px above the frame bottom.
