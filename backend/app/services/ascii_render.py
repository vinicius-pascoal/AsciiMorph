from __future__ import annotations

from io import BytesIO

from PIL import Image, ImageDraw, ImageFont


def _load_monospace_font() -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "consola.ttf",
        "cour.ttf",
        "DejaVuSansMono.ttf",
    ]

    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, 14)
        except OSError:
            continue

    return ImageFont.load_default()


def _ascii_to_image(ascii_art: str) -> Image.Image:
    lines = ascii_art.splitlines() or [""]
    max_columns = max((len(line) for line in lines), default=0)

    font = _load_monospace_font()

    # Use fixed-width cell metrics to avoid geometric distortion in exported media.
    left, top, right, bottom = font.getbbox("@")
    char_width = max(1, right - left)
    char_height = max(1, bottom - top)

    width = max(1, max_columns * char_width)
    height = max(1, len(lines) * char_height)

    image = Image.new("RGB", (width, height), (8, 10, 18))
    draw = ImageDraw.Draw(image)

    for row, line in enumerate(lines):
        y = row * char_height
        for col, char in enumerate(line):
            if char == " ":
                continue
            x = col * char_width
            draw.text((x, y), char, fill=(236, 239, 244), font=font)

    return image


def ascii_to_png_bytes(ascii_art: str) -> BytesIO:
    image = _ascii_to_image(ascii_art)
    output = BytesIO()
    image.save(output, format="PNG")
    output.seek(0)
    return output


def ascii_frames_to_gif_bytes(frames: list[str], fps: int) -> BytesIO:
    if not frames:
        raise ValueError("No ASCII frames to render")

    rendered = [_ascii_to_image(frame).convert(
        "P", palette=Image.Palette.ADAPTIVE) for frame in frames]
    duration_ms = max(1, int(round(1000 / max(fps, 1))))

    output = BytesIO()
    rendered[0].save(
        output,
        format="GIF",
        save_all=True,
        append_images=rendered[1:],
        duration=duration_ms,
        loop=0,
        optimize=False,
        disposal=2,
    )
    output.seek(0)
    return output
