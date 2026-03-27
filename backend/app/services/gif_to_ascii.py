from __future__ import annotations

from PIL import Image, ImageSequence

from app.services.image_to_ascii import image_to_ascii


def gif_to_ascii_frames(
    gif_image: Image.Image,
    width: int = 120,
    charset: str | None = None,
    invert: bool = False,
    max_frames: int = 120,
) -> tuple[list[str], int, int, int]:
    frames_ascii: list[str] = []

    extracted_frames = list(ImageSequence.Iterator(gif_image))[:max_frames]
    if not extracted_frames:
        raise ValueError("Could not read GIF frames")

    out_width = width
    out_height = 0

    for frame in extracted_frames:
        ascii_art, out_width, out_height = image_to_ascii(
            frame.convert("RGB"),
            width=width,
            charset=charset,
            invert=invert,
        )
        frames_ascii.append(ascii_art)

    duration_ms = gif_image.info.get("duration", 100)
    fps = max(1, int(1000 / max(duration_ms, 1)))

    return frames_ascii, out_width, out_height, fps
