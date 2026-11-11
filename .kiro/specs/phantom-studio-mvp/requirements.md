# Requirements - Phantom Studio MVP

Status: approved spec for the Kiroween 2026 submission (Frankenstein category).
All requirements use EARS format. Each requirement is traced to tasks in
`tasks.md`.

## Definitions

- **Script:** the English text the user types or pastes (one idea or short
  narration, 60-120 words for a 30-45s video).
- **Scene:** one of exactly 3 storyboard segments derived from the script.
- **TikTok law (subtitles):** subtitles are centered mid-screen, at least
  400px above the bottom edge of the 1080x1920 frame, split into chunks of
  3-6 words, at most 2 lines per chunk, with an amber keyword highlight.
- **Title card:** a 2.5 second opening card shown before any subtitle appears.
- **Voice track:** the spoken narration produced from the script.
- **Music bed:** procedurally generated background music via WebAudio.

## Functional requirements

### REQ-1 - Script input and storyboard split

WHEN the user enters a script and starts generation, THE SYSTEM SHALL split
the script into exactly 3 scenes, each scene carrying its own narration text
and a short visual direction (character pose, camera shot, background), and
THE SYSTEM SHALL display the 3-scene storyboard for review before rendering.

### REQ-2 - Title card

WHEN video playback or export starts, THE SYSTEM SHALL show a title card for
exactly 2.5 seconds, displaying the video title over a still stickman scene,
and THE SYSTEM SHALL NOT display any subtitle during the title card.

### REQ-3 - Stickman scene rendering

WHEN a scene is playing, THE SYSTEM SHALL render a 1080x1920 Canvas 2D frame
showing the stickman character (vendored `lib/stickman.js`) animated as a pure
function of scene time `t`, with camera moves from `lib/camera.js` and effects
from `lib/fx.js`, and THE SYSTEM SHALL keep world drawing inside the camera
transform and HUD/subtitles in screen space.

### REQ-4 - Voice (TTS)

WHEN the storyboard is confirmed, THE SYSTEM SHALL produce a voice track for
the full script using one voice, and THE SYSTEM SHALL expose the voice behind
a `VoiceProvider` interface so the default Web Speech API provider can be
replaced without changing the render pipeline. WHEN the voice provider is
unavailable in the browser, THE SYSTEM SHALL show a clear error and refuse to
start a silent render.

### REQ-5 - Subtitles (TikTok law)

WHEN narration is playing, THE SYSTEM SHALL display subtitles that satisfy
all of the following:
- each chunk contains 3-6 words and at most 2 lines;
- chunks preserve the exact words and order of the narration (no word lost,
  added, or reordered);
- the subtitle box is horizontally centered and its bottom edge is at least
  400px above the bottom of the 1080x1920 frame;
- one keyword per chunk is highlighted in amber, the rest in white;
- no subtitle is shown during the 2.5s title card.

### REQ-6 - Music and ducking

WHEN the video is playing, THE SYSTEM SHALL play a procedurally generated
WebAudio music bed, and THE SYSTEM SHALL duck the music gain while the voice
is speaking so the voice stays clearly audible. WHEN the voice is silent
between phrases, THE SYSTEM SHALL return the music to its base level.

### REQ-7 - Export (WebM)

WHEN the user requests export, THE SYSTEM SHALL record the 1080x1920 canvas
plus the mixed voice and music into a single video file using MediaRecorder,
and THE SYSTEM SHALL produce a downloadable file whose duration is 30-45
seconds and whose audio and video stay in sync within 0.1s. WHEN
MediaRecorder or the required codec is unavailable, THE SYSTEM SHALL show a
clear error instead of producing a silent or broken file.

### REQ-8 - MP4 export (stretch goal)

WHEN the MP4 stretch goal is attempted, THE SYSTEM SHALL produce an MP4 file
via ffmpeg.wasm only if the wasm binary loads and encoding completes within
the browser's memory limits; otherwise THE SYSTEM SHALL fall back to the WebM
export from REQ-7 and tell the user the MP4 path was skipped and why. MP4 is
NOT required for the MVP to be considered complete.

### REQ-9 - Audio-first duration

WHEN the voice track is produced, THE SYSTEM SHALL set the total video
duration from the voice track duration (plus the 2.5s title card), and THE
SYSTEM SHALL NOT render video frames beyond that duration.

### REQ-10 - Browser-only, no build step

WHEN the app is opened, THE SYSTEM SHALL run entirely in the browser with no
server, no user account, and no build step: opening `index.html` (served over
HTTP for ES modules) is enough to use every MVP feature.

## Non-functional requirements

### REQ-11 - Kiro usage evidence

WHEN the project is judged, THE SYSTEM (repository) SHALL contain a complete
`.kiro/` directory at its root with specs, steering docs, and hooks, and THE
SYSTEM SHALL NOT list `.kiro` in `.gitignore`, so that judges can verify
spec-driven development.

### REQ-12 - Disclosure

WHEN the project is submitted, THE SYSTEM (repository) SHALL disclose the
pre-existing vendored code in `lib/` (`stickman.js`, `camera.js`, `fx.js`) in
`README.md` and `lib/LIB_ORIGIN.md`, as required by the Kiroween 2026
Official Rules.
