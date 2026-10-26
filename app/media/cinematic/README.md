# Erythmind opening assets

These assets adapt the logo and opening/reference images supplied in the task. They are art adaptations, not a claim that the playable models have the same fidelity as the key art.

- `logo.webp`: transparent symbol and wordmark.
- `opening.webp`: landscape opening art.
- `opening-mobile.webp`: portrait composition with the full title visible.
- `opening.mp4`: 18 seconds, 1280×720, 24 fps, H.264 + AAC, fast-start streaming. A logo reveal leads into a slow camera push over the opening art, accompanied by a synthesized ambient chord.

Configuration lives in `app/cinematic-media.js`. The screen uses a still poster until the player chooses **Tonton intro**. Audio starts muted and can be enabled. Completion, **Langkau**, or Escape returns to the secure gate. **Tonton semula intro** reopens it. A missing or unplayable video falls back to a 24-second camera sequence over the actual game world. Reduced-motion users get a still welcome screen and fixed camera framing in that fallback.

Media is deliberately under `app/` so the legacy `tools/build.py` asset-regeneration step does not delete it. The authoritative uncompressed image-generation outputs remain outside the repository in `/workspace/generated_images`; the shipped WebP files reduce transfer size.
