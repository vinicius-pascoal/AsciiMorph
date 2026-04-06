from __future__ import annotations

from PIL import Image, ImageFilter, ImageOps

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

    normalized = [value.strip()
                  for value in mosaic_charsets.split("|") if value.strip()]
    return normalized


def _normalize_typography_letters(typography_letters: str | None) -> str:
    if not typography_letters:
        return ""

    # Remove whitespaces para evitar "caracteres invisiveis" no conjunto tipografico.
    return "".join(char for char in typography_letters if not char.isspace())


def _restrict_charset_to_typography(charset: str, typography_letters: str) -> str:
    restricted = "".join(
        char for char in charset if char in typography_letters)
    if restricted:
        return restricted
    return typography_letters


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


def _map_pixels_to_ascii_duotone(
    pixels: list[int],
    dark_charset: str,
    light_charset: str,
    threshold: int,
    invert: bool,
) -> str:
    dark_chars = dark_charset[::-1] if invert else dark_charset
    light_chars = light_charset[::-1] if invert else light_charset

    dark_last = len(dark_chars) - 1
    light_last = len(light_chars) - 1

    mapped: list[str] = []
    dark_range = max(threshold, 1)
    light_range = max(255 - threshold, 1)

    for value in pixels:
        if value <= threshold:
            normalized = value / dark_range
            idx = int(normalized * dark_last)
            mapped.append(dark_chars[idx])
            continue

        normalized = (value - threshold) / light_range
        idx = int(normalized * light_last)
        mapped.append(light_chars[idx])

    return "".join(mapped)


def _map_pixels_to_ascii_layers(
    pixels: list[int],
    edge_pixels: list[int],
    width: int,
    height: int,
    background_charset: str,
    subject_charset: str,
    text_charset: str,
    invert: bool,
    text_edge_threshold: int,
    subject_delta_threshold: int,
) -> str:
    background_chars = background_charset[::-
                                          1] if invert else background_charset
    subject_chars = subject_charset[::-1] if invert else subject_charset
    text_chars = text_charset[::-1] if invert else text_charset

    background_last = len(background_chars) - 1
    subject_last = len(subject_chars) - 1
    text_last = len(text_chars) - 1

    mapped: list[str] = []
    for index, value in enumerate(pixels):
        x = index % width
        y = index // max(width, 1)

        left_x = x - 1 if x > 0 else x
        right_x = x + 1 if x < width - 1 else x
        up_y = y - 1 if y > 0 else y
        down_y = y + 1 if y < height - 1 else y

        left = pixels[y * width + left_x]
        right = pixels[y * width + right_x]
        up = pixels[up_y * width + x]
        down = pixels[down_y * width + x]

        local_average = (left + right + up + down) / 4
        local_delta = abs(value - local_average)
        edge_strength = edge_pixels[index]

        is_text = edge_strength >= text_edge_threshold and 40 <= value <= 220
        is_subject = local_delta >= subject_delta_threshold and not is_text

        if is_text:
            idx = int((value / 255) * text_last)
            mapped.append(text_chars[idx])
            continue

        if is_subject:
            idx = int((value / 255) * subject_last)
            mapped.append(subject_chars[idx])
            continue

        idx = int((value / 255) * background_last)
        mapped.append(background_chars[idx])

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
    typography_mode: bool = False,
    typography_letters: str | None = None,
) -> tuple[str, int, int]:
    if width < 20 or width > 300:
        raise ValueError("Width must be between 20 and 300")

    chars = _normalize_charset(charset)
    normalized_mosaic_charsets = _normalize_mosaic_charsets(mosaic_charsets)
    dark_charset = _normalize_charset(duotone_dark_charset)
    light_charset = _normalize_charset(duotone_light_charset)
    background_charset = _normalize_charset(layers_background_charset)
    subject_charset = _normalize_charset(layers_subject_charset)
    text_charset = _normalize_charset(layers_text_charset)

    if duotone_mode:
        if duotone_threshold < 1 or duotone_threshold > 254:
            raise ValueError("Duotone threshold must be between 1 and 254")

    if layers_mode:
        if layers_text_edge_threshold < 1 or layers_text_edge_threshold > 255:
            raise ValueError(
                "Layers text edge threshold must be between 1 and 255")
        if layers_subject_delta_threshold < 1 or layers_subject_delta_threshold > 255:
            raise ValueError(
                "Layers subject delta threshold must be between 1 and 255")

    normalized_typography_letters = _normalize_typography_letters(
        typography_letters)
    if typography_mode and not normalized_typography_letters:
        raise ValueError(
            "Typography letters must have at least 1 non-space character")

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
            raise ValueError(
                "Each mosaic charset must have at least 1 character")

    if typography_mode:
        chars = _restrict_charset_to_typography(
            chars, normalized_typography_letters)
        dark_charset = _restrict_charset_to_typography(
            dark_charset, normalized_typography_letters)
        light_charset = _restrict_charset_to_typography(
            light_charset, normalized_typography_letters)
        background_charset = _restrict_charset_to_typography(
            background_charset, normalized_typography_letters)
        subject_charset = _restrict_charset_to_typography(
            subject_charset, normalized_typography_letters)
        text_charset = _restrict_charset_to_typography(
            text_charset, normalized_typography_letters)

        if mosaic_mode:
            block_charsets = [
                _restrict_charset_to_typography(
                    block_charset, normalized_typography_letters)
                for block_charset in block_charsets
            ]

    gray_image = ImageOps.grayscale(image)
    original_width, original_height = gray_image.size

    aspect_ratio = original_height / max(original_width, 1)
    corrected_height = max(1, int(width * aspect_ratio * 0.55))

    resized = gray_image.resize((width, corrected_height))
    pixels = list(resized.getdata())

    if layers_mode:
        edges = resized.filter(ImageFilter.FIND_EDGES)
        edge_pixels = list(edges.getdata())

        ascii_flat = _map_pixels_to_ascii_layers(
            pixels=pixels,
            edge_pixels=edge_pixels,
            width=width,
            height=corrected_height,
            background_charset=background_charset,
            subject_charset=subject_charset,
            text_charset=text_charset,
            invert=invert,
            text_edge_threshold=layers_text_edge_threshold,
            subject_delta_threshold=layers_subject_delta_threshold,
        )
    elif duotone_mode:
        ascii_flat = _map_pixels_to_ascii_duotone(
            pixels=pixels,
            dark_charset=dark_charset,
            light_charset=light_charset,
            threshold=duotone_threshold,
            invert=invert,
        )
    elif mosaic_mode:
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
