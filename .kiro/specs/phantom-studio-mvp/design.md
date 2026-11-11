# Design - Phantom Studio MVP

## Overview

Phantom Studio is a browser-only, no-build-step web app. The pipeline is
audio-first and deterministic, inherited from Tony's local-video-pipeline
skill but re-implemented for the browser:

```
script text
  -> [script.js] storyboard splitter (3 scenes, narration + visual direction)
  -> [voice.js] VoiceProvider produces the voice track (duration = master clock)
  -> [subtitles.js] chunker + safe-zone layout (TikTok law)
  -> [render.js] Canvas 2D frame renderer, pure function of t
  -> [music.js] procedural WebAudio bed + ducking
  -> [export.js] canvas.captureStream + MediaRecorder -> WebM download
```

## Component boundaries

| Module | Owns | Must never do |
|---|---|---|
| `src/script.js` | Parsing input, splitting into 3 scenes, per-scene narration + visual direction | Draw anything, touch audio |
| `src/scenes.js` | Per-scene staging: character pose keys, camera shots, background, effects | Parse user text |
| `src/render.js` | `draw(ctx, t, W, H, scene)` - pure function of `t` | Read wall-clock time, touch DOM/audio |
| `src/voice.js` | `VoiceProvider` interface + Web Speech provider; exposes voice duration and per-word timing estimate | Draw or export |
| `src/subtitles.js` | Chunker (3-6 words, max 2 lines) + layout (centered, bottom >= 400px above frame bottom) + amber keyword | Decide scene content |
| `src/music.js` | Procedural bed (oscillators + gain envelopes) + ducking automation | Touch the canvas |
| `src/export.js` | MediaRecorder lifecycle, stream mixing, file download | Decide what a scene looks like |
| `src/main.js` | UI wiring, state machine (idle -> storyboard -> voice -> preview -> export) | Business logic of other modules |

## Render pipeline

- Frame size is fixed at 1080x1920, 30 fps.
- Preview uses `requestAnimationFrame`; each frame calls `render.draw(ctx, t, 1080, 1920, scene)` where `t` is seconds since the video start (title card occupies `t in [0, 2.5)`).
- Export reuses the exact same `draw` function, driven by
  `canvas.captureStream(30)` into a MediaRecorder, so preview and export
  cannot drift apart.
- World drawing happens inside the camera transform (`camera.at` /
  `camera.apply`); subtitles and HUD are drawn after `ctx.restore()`, in
  screen space.
- The vendored libs are CommonJS (`module.exports`). The browser build loads
  them through a tiny shim that provides a `module` object, or an ESM wrapper
  that re-exports their API. The shim is written in Task 4; the vendored files
  themselves are not modified.

## Subtitle chunking and layout

- Chunker: greedy word packing, 3-6 words per chunk, at most 2 lines per
  chunk (line break placed at the chunk midpoint when a chunk wraps). Keyword
  selection: the longest content word in the chunk (nouns/verbs preferred;
  stop-words never highlighted).
- Timing: chunk boundaries are derived from the voice track. The Web Speech
  API does not give reliable per-word timestamps, so the MVP estimates
  per-word timing from word count and the measured total voice duration, and
  re-syncs at each scene boundary. This estimation error is documented as a
  known MVP limitation; a higher-quality TTS provider with real word timings
  is the first post-MVP swap (the `VoiceProvider` interface exists for this).
- Layout check (enforced in code and in tests): subtitle box bottom edge
  `<= 1920 - 400 = 1520px` in frame coordinates.

## Music and ducking (honest note)

WebAudio has no native sidechain compressor. The MVP approximates ducking by
scheduling the music bus gain: a `GainNode` on the music bus is automated down
(e.g. to 0.25x) during voiced segments and back up during pauses, driven by
the same per-word timing estimate used for subtitles. This is an
approximation, not true sidechain compression, and it is documented as such.
If the estimate drifts, the fallback is a fixed low music level during the
whole narration.

## Export decision and risk

- **Baseline (required): MediaRecorder WebM.** `video/webm` with VP8/VP9 is
  supported in Chrome/Edge, which is the MVP's target browser. The canvas
  stream and a `MediaStreamDestination` audio mix are combined into one
  MediaRecorder. Risk: low. WebM plays in browsers and on most social
  upload flows, but TikTok's uploader prefers MP4.
- **Stretch goal (optional): MP4 via ffmpeg.wasm.** Requires downloading a
  ~30MB wasm binary, encoding 1080x1920 frames in-browser, and holding the
  encoded output in memory. Risks, stated honestly: slow encode on low-end
  machines, high memory use, and possible failure on large outputs. Decision:
  attempt it only after WebM export is verified end-to-end; if it fails or is
  too slow, ship WebM only and say so in the submission. MP4 is NOT a
  release blocker (REQ-8).

## Property-based testing plan

Planned with `fast-check` (to be added as a devDependency in Task 2):

- **Subtitle chunker properties** (for any random word list of length 1-200):
  - every chunk has 3-6 words, except possibly the final chunk (1-6 words);
  - concatenating all chunks reproduces the input word list exactly (no loss,
    no reorder, no duplication);
  - no chunk renders to more than 2 lines at the chosen font size and max
    width (checked by measuring with an offscreen canvas).
- **Safe-zone properties** (for any random chunk and frame size):
  - the computed subtitle box bottom is always `<= H - 400`;
  - the box is horizontally centered within 1px.
- **Title-card property:** for `t < 2.5`, the subtitle engine returns no
  subtitle; for `t >= 2.5`, it returns the chunk active at that time.
- **Duration property:** total video duration equals voice duration + 2.5s,
  within the measurement tolerance of the voice provider.

## Frankenstein fit

The category asks for a chimera of seemingly incompatible technologies. Here
the chimera is: a Node-style deterministic Canvas render pipeline (from
Tony's code-driven video skill) + browser TTS + WebAudio procedural music +
MediaRecorder export, all running with no server and no build step. The
write-up for judges will name each stitched part and what it contributes.
