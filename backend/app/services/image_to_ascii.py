from __future__ import annotations

from PIL import Image, ImageOps

DEFAULT_CHARSET = "@%#*+=-:. "


def _normalize_charset(charset: str | None) -> str:
    if charset and charset.strip():
        return charset
    return DEFAULT_CHARSET


def _map_pixels_to_ascii(pixels: list[int], charset: str, invert: bool) -> str:
    chars = charset[::-1] if invert else charset
    last_index = len(chars) - 1

    mapped = []
    for value in pixels:
        idx = int((value / 255) * last_index)
        mapped.append(chars[idx])

    return "".join(mapped)


def image_to_ascii(
    image: Image.Image,
    width: int = 120,
    charset: str | None = None,
    invert: bool = False,
) -> tuple[str, int, int]:
    if width < 20 or width > 300:
        raise ValueError("Width must be between 20 and 300")

    chars = _normalize_charset(charset)

    gray_image = ImageOps.grayscale(image)
    original_width, original_height = gray_image.size

    aspect_ratio = original_height / max(original_width, 1)
    corrected_height = max(1, int(width * aspect_ratio * 0.55))

    resized = gray_image.resize((width, corrected_height))
    pixels = list(resized.getdata())

    ascii_flat = _map_pixels_to_ascii(pixels, chars, invert)
    lines = [ascii_flat[i: i + width]
             for i in range(0, len(ascii_flat), width)]

    return "\n".join(lines), width, corrected_height
