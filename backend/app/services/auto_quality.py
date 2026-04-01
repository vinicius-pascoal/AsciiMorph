from __future__ import annotations

from PIL import Image, ImageStat


DEFAULT_CHARSET = "@%#*+=-:. "


def infer_ascii_settings(image: Image.Image) -> tuple[int, str, bool]:
    """Infer width, charset and invert based on image characteristics."""
    rgb = image.convert("RGB")
    gray = rgb.convert("L")

    width, height = gray.size
    total_pixels = max(width * height, 1)

    # Width: keep detail for larger images while staying inside API bounds.
    longest_side = max(width, height)
    if longest_side <= 480:
        out_width = 80
    elif longest_side <= 900:
        out_width = 110
    elif longest_side <= 1400:
        out_width = 140
    elif longest_side <= 2200:
        out_width = 180
    else:
        out_width = 220

    stat = ImageStat.Stat(gray)
    mean_luma = stat.mean[0]
    luma_stddev = stat.stddev[0]

    # Dense charsets preserve detail when contrast is richer.
    if luma_stddev < 35:
        charset = "@#*:. "
    elif total_pixels > 1_600_000:
        charset = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "
    elif total_pixels > 900_000:
        charset = "@#%WM8B$&*+=-:. "
    else:
        charset = DEFAULT_CHARSET

    # Dark images usually read better when the ramp is inverted.
    invert = mean_luma < 95

    return out_width, charset, invert
