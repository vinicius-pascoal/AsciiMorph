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


def _normalize_mosaic_charsets(mosaic_charsets: str | None) -> list[str]:
    if not mosaic_charsets:
        return []

    normalized = [value.strip() for value in mosaic_charsets.split("|") if value.strip()]
    return normalized


def _map_pixels_to_ascii_mosaic(
    pixels: list[int],
    width: int,
    height: int,
    invert: bool,
    blocks_x: int,
    blocks_y: int,
    block_charsets: list[str],
) -> str:
    mapped: list[str] = []

    for y in range(height):
        block_y = min((y * blocks_y) // max(height, 1), blocks_y - 1)
        for x in range(width):
            block_x = min((x * blocks_x) // max(width, 1), blocks_x - 1)
            block_idx = (block_y * blocks_x + block_x) % len(block_charsets)

            charset = block_charsets[block_idx]
            chars = charset[::-1] if invert else charset
            last_index = len(chars) - 1

            value = pixels[y * width + x]
            idx = int((value / 255) * last_index)
            mapped.append(chars[idx])

    return "".join(mapped)


def image_to_ascii(
    image: Image.Image,
    width: int = 120,
    charset: str | None = None,
    invert: bool = False,
    mosaic_mode: bool = False,
    mosaic_blocks_x: int = 3,
    mosaic_blocks_y: int = 3,
    mosaic_charsets: str | None = None,
) -> tuple[str, int, int]:
    if width < 20 or width > 300:
        raise ValueError("Width must be between 20 and 300")

    chars = _normalize_charset(charset)
    normalized_mosaic_charsets = _normalize_mosaic_charsets(mosaic_charsets)

    if mosaic_mode:
        if mosaic_blocks_x < 1 or mosaic_blocks_x > 8:
            raise ValueError("Mosaic blocks_x must be between 1 and 8")
        if mosaic_blocks_y < 1 or mosaic_blocks_y > 8:
            raise ValueError("Mosaic blocks_y must be between 1 and 8")

        if normalized_mosaic_charsets:
            block_charsets = normalized_mosaic_charsets
        else:
            block_count = max(1, mosaic_blocks_x * mosaic_blocks_y)
            block_charsets = [chars] * block_count

        if any(len(charset_item) == 0 for charset_item in block_charsets):
            raise ValueError("Each mosaic charset must have at least 1 character")

    gray_image = ImageOps.grayscale(image)
    original_width, original_height = gray_image.size

    aspect_ratio = original_height / max(original_width, 1)
    corrected_height = max(1, int(width * aspect_ratio * 0.55))

    resized = gray_image.resize((width, corrected_height))
    pixels = list(resized.getdata())

    if mosaic_mode:
        ascii_flat = _map_pixels_to_ascii_mosaic(
            pixels=pixels,
            width=width,
            height=corrected_height,
            invert=invert,
            blocks_x=mosaic_blocks_x,
            blocks_y=mosaic_blocks_y,
            block_charsets=block_charsets,
        )
    else:
        ascii_flat = _map_pixels_to_ascii(pixels, chars, invert)

    lines = [ascii_flat[i: i + width]
             for i in range(0, len(ascii_flat), width)]

    return "\n".join(lines), width, corrected_height
