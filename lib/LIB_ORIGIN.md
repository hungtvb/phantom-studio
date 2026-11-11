# Origin of lib/

The files in this directory are pre-existing code, reused with disclosure as
required by the Kiroween 2026 Official Rules ("must disclose any other
pre-existing code or work incorporated into the Project").

## Source

`~/workspace/custom-skills/local-video-pipeline/lib/`, from Tony's
local-video-pipeline skill (code-driven video pipeline: deterministic Canvas 2D
scenes rendered in Node, ffmpeg encode, TTS + ducked music + subtitles).

| File | What it is | Origin |
|---|---|---|
| `stickman.js` | Procedural stick-figure rig: poses (`POSE`), `base`, `lerpPose`, `keyPose` keyframe interpolation, `walk` cycle, `draw`. Units: 1 = character height. | local-video-pipeline `lib/stickman.js` |
| `camera.js` | Virtual 2D camera: `shot`, `at`, `apply` (pan/zoom/shake, eased). | local-video-pipeline `lib/camera.js` |
| `fx.js` | Deterministic effects helpers: easing, `fade`/`pop`/`slide`, seeded particles, transitions, `glow`. | local-video-pipeline `lib/fx.js` |

## What was changed

Nothing, except a header comment added to each file stating its origin and that
it is pre-existing code reused with disclosure. The code itself is byte-identical
to the source files.

## What was NOT reused

The rest of the local-video-pipeline skill (the Node render pipeline
`render.js`, `mix_audio.py`, `mux.sh`, `timings_to_ass.py`, templates, and the
`shot04-demo` scenes) was NOT copied into this repository. Phantom Studio
re-implements the same *approach* (audio-first, deterministic frames, TikTok
subtitle law) in browser code, written fresh during the submission period.

## Disclosure in the Devpost submission

The Devpost submission will list these three files as pre-existing code, with
this file (`lib/LIB_ORIGIN.md`) as the reference. Everything else in this
repository was created during the Kiroween 2026 submission period
(30 Oct - 4 Dec 2026).
