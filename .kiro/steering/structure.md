# Structure - Phantom Studio

## Repository layout

```
phantom-studio/
  README.md                  # What this is, Frankenstein category, disclosure
  LICENSE                    # MIT, Copyright (c) 2026 Hung Tran
  package.json               # Scripts: test, lint (node --check for now)
  .gitignore                 # .kiro is INTENTIONALLY NOT ignored (see comment)
  index.html                 # (Planned, Task 7) App entry point, no build step
  src/                       # (Planned) App source, vanilla JS
    main.js                  # App bootstrap and UI wiring
    script.js                # Script input parsing + storyboard splitter
    scenes.js                # Scene definitions (3 scenes, stickman staging)
    render.js                # Canvas 2D frame renderer (pure function of t)
    voice.js                 # VoiceProvider interface + Web Speech provider
    subtitles.js             # Subtitle chunker + safe-zone layout
    music.js                 # Procedural WebAudio bed + ducking
    export.js                # MediaRecorder WebM export (+ ffmpeg.wasm stretch)
  lib/                       # VENDORED pre-existing code (disclosed, see LIB_ORIGIN.md)
    stickman.js              # Stick-figure rig
    camera.js                # Virtual 2D camera
    fx.js                    # Deterministic effects helpers
    LIB_ORIGIN.md            # What was reused and why
  .kiro/
    steering/                # Product vision, tech stack, this file
      product.md
      tech.md
      structure.md
    specs/phantom-studio-mvp/
      requirements.md        # EARS requirements (REQ-1..REQ-10)
      design.md              # Architecture, export decision, PBT plan
      tasks.md               # Sequenced tasks with requirement traces
    hooks/                   # Agent hooks (run on file save)
      run-tests-on-save.json
      format-on-save.json
    settings/
      mcp.json               # MCP fetch server
```

## Conventions

- **Docs are in English.** Submission materials for Kiroween 2026 must be in
  English (or carry an English translation); all user-facing docs in this repo
  are English.
- **Specs before code.** A feature is not implemented until its requirement,
  design note, and task exist in `.kiro/specs/phantom-studio-mvp/`. Tasks cite
  the requirement they satisfy.
- **One module per concern.** `script.js` never draws; `render.js` never
  touches audio; `subtitles.js` owns chunking and layout; `export.js` owns the
  MediaRecorder lifecycle.
- **Determinism.** Anything time-dependent is a function of `t` (seconds since
  the start of the current scene or video), never of `Date.now()` or frame
  count alone.
- **Tests live with the code they cover.** Unit tests in `src/__tests__/` (to
  be created with Task 2); property-based tests for the subtitle chunker and
  safe-zone layout are required before the exporter is considered done.
