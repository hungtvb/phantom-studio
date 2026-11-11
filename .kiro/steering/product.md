# Product - Phantom Studio

## Vision

Every creator has ideas that never become videos because editing takes too long.
Phantom Studio turns a short script into a finished vertical video in the
browser, in minutes, with no editing timeline and no installed software.

## Problem

Making a 30-45 second TikTok/Reel by hand means: writing a script, recording
or synthesizing a voice, animating or filming visuals, timing subtitles,
mixing music under the voice, and exporting vertical video. Each step needs a
different tool. Creators either pay for heavy editors or skip the video
entirely.

## Audience

Short-form creators who publish explainer / fun-fact / story videos and want a
fast first draft they can post or refine. The MVP targets English-language
scripts; the subtitle and voice layers are designed to be language-pluggable
later.

## MVP scope (locked)

- Input: one idea or short script typed by the user.
- Output: one 30-45 second vertical video, 1080x1920.
- Exactly 3 scenes, generated from the script by a storyboard splitter.
- One TTS voice (Web Speech API default for the MVP; provider interface is
  pluggable so a better voice can be swapped in later).
- One stickman character, animated with the vendored `lib/stickman.js` rig.
- Subtitles per Tony's TikTok law (see requirements REQ-5).
- One procedurally generated music bed, ducked under the voice.
- Export: MediaRecorder WebM in the browser. MP4 via ffmpeg.wasm is a stretch
  goal, decided in `design.md`.

## Non-goals for the MVP

- No user accounts, no server, no cloud rendering, no database.
- No multi-character scenes, no image generation, no video upload.
- No editing timeline; the user edits the script, not the video.
- No mobile app; desktop browser first (the output is vertical video for
  phones, the tool itself runs on desktop).

## Success criteria

1. A first-time user goes from a typed idea to a downloaded 30-45s vertical
   video in under 5 minutes.
2. The video plays end-to-end with voice, subtitles, and music in sync; the
   subtitle box never enters the bottom 400px safe-zone exclusion.
3. The demo video (under 3 minutes) shows the full flow on a real script.
4. The `.kiro/` directory shows real spec-driven development: requirements,
   design, and tasks that trace to the shipped code.
