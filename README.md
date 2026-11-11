# Phantom Studio

**Kiroween 2026 - Frankenstein category**

Phantom Studio is a browser-only web app that turns a short script or idea into a
TikTok-ready vertical video (1080x1920), entirely in the browser:

1. Type an idea or paste a script.
2. The app splits it into a **3-scene storyboard**.
3. Each scene is animated with a **stickman Canvas 2D rig**.
4. One **TTS voice** reads the script (Web Speech API by default; pluggable).
5. **Subtitles** follow Tony's TikTok law: centered mid-screen, at least 400px above
   the bottom edge, 3-6 word chunks, max 2 lines, amber keyword highlight, with a
   2.5s title card first.
6. **Procedurally ducked background music** via WebAudio.
7. Export a **30-45 second vertical video** (MediaRecorder WebM; MP4 via ffmpeg.wasm
   is a stretch goal - see `design.md` for the decision and its risk).

## Status

**Scaffold only.** This repository currently contains the Kiro spec, steering docs,
hooks, MCP config, and vendored libraries. The app itself (`src/`, UI, render
pipeline) is not implemented yet. See `.kiro/specs/phantom-studio-mvp/tasks.md`
for the build plan.

## How to run (once implemented)

```bash
# No build step for the MVP: open the app in a modern browser.
# A static server is recommended so ES modules load correctly:
npx --yes serve .
# then open http://localhost:3000
```

Requirements for the MVP: a modern desktop browser (Chrome/Edge) with Web Speech
API, WebAudio, Canvas 2D, and MediaRecorder support.

## Architecture overview

```
User script/idea
  -> Script parser / storyboard splitter (3 scenes)
  -> Scene renderer (stickman Canvas 2D, 1080x1920, deterministic frames)
  -> Voice track (TTS, audio-first: video duration = voice duration)
  -> Subtitle engine (chunker + safe-zone layout, TikTok law)
  -> Music engine (procedural WebAudio, ducked under voice)
  -> Exporter (canvas.captureStream + MediaRecorder -> WebM)
```

Design principles, inherited from Tony's local-video-pipeline skill:

- **Audio first.** The voice track is locked before video is rendered; video
  duration equals audio duration.
- **Deterministic frames.** Every frame is a pure function of `t = N/fps`; no
  realtime capture, no dropped frames.
- **Art direction locked before code.** Visual style is fixed in
  `.kiro/steering/product.md` before scene code is written.

## How Kiro was used

This project was built with Kiro (spec-driven development):

- `.kiro/specs/phantom-studio-mvp/` - requirements (EARS), design, and sequenced
  tasks. The spec was reviewed and approved before any implementation.
- `.kiro/steering/` - product vision, tech stack, and repo structure/conventions.
- `.kiro/hooks/` - automated checks on file save (tests, formatting).
- `.kiro/settings/mcp.json` - MCP fetch server for documentation lookup.

## Disclosure of pre-existing code (Kiroween 2026 Official Rules)

The Kiroween 2026 Official Rules allow frameworks, libraries, and starter
templates, and require disclosure of "any other pre-existing code or work
incorporated into the Project". The following files in this repository are
pre-existing code, written before the submission period (30 Oct - 4 Dec 2026)
as part of Tony's local-video-pipeline skill, reused unchanged except for a
header comment:

- `lib/stickman.js` - procedural stick-figure rig (poses, keyframe interpolation,
  walk cycle, drawing).
- `lib/camera.js` - virtual 2D camera (shots, easing, shake).
- `lib/fx.js` - deterministic effects helpers (easing, fades, particles,
  transitions, glow).

See `lib/LIB_ORIGIN.md` for full details. Everything else in this repository
(`README.md`, `.kiro/` specs/steering/hooks, and the app code in `src/` once
written) was created during the Kiroween 2026 submission period for this
project.

## License

MIT - see `LICENSE`. Copyright (c) 2026 Hung Tran.
