from __future__ import annotations

from PIL import Image, ImageSequence

from app.services.image_to_ascii import image_to_ascii


def gif_to_ascii_frames(
    gif_image: Image.Image,
    width: int = 120,
    charset: str | None = None,
    invert: bool = False,
    mosaic_mode: bool = False,
    mosaic_blocks_x: int = 3,
    mosaic_blocks_y: int = 3,
    mosaic_charsets: str | None = None,
    duotone_mode: bool = False,
    duotone_threshold: int = 128,
    duotone_dark_charset: str | None = None,
    duotone_light_charset: str | None = None,
    layers_mode: bool = False,
    layers_background_charset: str | None = None,
    layers_subject_charset: str | None = None,
    layers_text_charset: str | None = None,
    layers_text_edge_threshold: int = 40,
    layers_subject_delta_threshold: int = 24,
    max_frames: int = 120,
) -> tuple[list[str], int, int, int]:
    frames_ascii: list[str] = []

    iterator = ImageSequence.Iterator(gif_image)
    base_rgba = Image.new("RGBA", gif_image.size, (0, 0, 0, 0))
    durations_ms: list[int] = []

    out_width = width
    out_height = 0

    for idx, frame in enumerate(iterator):
        if idx >= max_frames:
            break

        frame_rgba = frame.convert("RGBA")
        composed_rgba = Image.alpha_composite(base_rgba, frame_rgba)
        base_rgba = composed_rgba.copy()

        ascii_art, out_width, out_height = image_to_ascii(
            composed_rgba.convert("RGB"),
            width=width,
            charset=charset,
            invert=invert,
            mosaic_mode=mosaic_mode,
            mosaic_blocks_x=mosaic_blocks_x,
            mosaic_blocks_y=mosaic_blocks_y,
            mosaic_charsets=mosaic_charsets,
            duotone_mode=duotone_mode,
            duotone_threshold=duotone_threshold,
            duotone_dark_charset=duotone_dark_charset,
            duotone_light_charset=duotone_light_charset,
            layers_mode=layers_mode,
            layers_background_charset=layers_background_charset,
            layers_subject_charset=layers_subject_charset,
            layers_text_charset=layers_text_charset,
            layers_text_edge_threshold=layers_text_edge_threshold,
            layers_subject_delta_threshold=layers_subject_delta_threshold,
        )
        frames_ascii.append(ascii_art)

        frame_duration = int(frame.info.get(
            "duration", gif_image.info.get("duration", 100)))
        durations_ms.append(max(1, frame_duration))

    if not frames_ascii:
        raise ValueError("Could not read GIF frames")

    average_duration_ms = sum(durations_ms) / max(len(durations_ms), 1)
    fps = max(1, int(round(1000 / max(average_duration_ms, 1))))

    return frames_ascii, out_width, out_height, fps
