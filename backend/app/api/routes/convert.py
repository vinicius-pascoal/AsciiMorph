from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image, UnidentifiedImageError

from app.schemas.responses import GifAsciiFrame, GifAsciiResponse, ImageAsciiResponse
from app.services.ascii_render import ascii_frames_to_gif_bytes, ascii_to_png_bytes
from app.services.auto_quality import infer_ascii_settings
from app.services.gif_to_ascii import gif_to_ascii_frames
from app.services.image_to_ascii import image_to_ascii

router = APIRouter(prefix="/convert", tags=["convert"])

ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp"}
ALLOWED_GIF_TYPE = "image/gif"


@router.post("/image", response_model=ImageAsciiResponse)
async def convert_image_to_ascii(
    file: UploadFile = File(...),
    width: int = Form(120),
    charset: str = Form("@%#*+=-:. "),
    invert: bool = Form(False),
    auto_quality: bool = Form(False),
    mosaic_mode: bool = Form(False),
    mosaic_blocks_x: int = Form(3),
    mosaic_blocks_y: int = Form(3),
    mosaic_charsets: str = Form(""),
) -> ImageAsciiResponse:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image format")

    try:
        content = await file.read()
        image = Image.open(BytesIO(content)).convert("RGB")
    except UnidentifiedImageError as error:
        raise HTTPException(
            status_code=400, detail="Invalid image file") from error

    if auto_quality:
        width, charset, invert = infer_ascii_settings(image)

    try:
        ascii_art, out_width, out_height = image_to_ascii(
            image,
            width=width,
            charset=charset,
            invert=invert,
            mosaic_mode=mosaic_mode,
            mosaic_blocks_x=mosaic_blocks_x,
            mosaic_blocks_y=mosaic_blocks_y,
            mosaic_charsets=mosaic_charsets,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return ImageAsciiResponse(ascii_art=ascii_art, width=out_width, height=out_height)


@router.post("/gif", response_model=GifAsciiResponse)
async def convert_gif_to_ascii(
    file: UploadFile = File(...),
    width: int = Form(120),
    charset: str = Form("@%#*+=-:. "),
    invert: bool = Form(False),
    auto_quality: bool = Form(False),
    mosaic_mode: bool = Form(False),
    mosaic_blocks_x: int = Form(3),
    mosaic_blocks_y: int = Form(3),
    mosaic_charsets: str = Form(""),
) -> GifAsciiResponse:
    if file.content_type != ALLOWED_GIF_TYPE:
        raise HTTPException(status_code=400, detail="Unsupported GIF format")

    try:
        content = await file.read()
        gif_image = Image.open(BytesIO(content))
    except UnidentifiedImageError as error:
        raise HTTPException(
            status_code=400, detail="Invalid GIF file") from error

    if auto_quality:
        preview_frame = gif_image.convert("RGB")
        width, charset, invert = infer_ascii_settings(preview_frame)

    try:
        frames_ascii, out_width, out_height, fps = gif_to_ascii_frames(
            gif_image,
            width=width,
            charset=charset,
            invert=invert,
            mosaic_mode=mosaic_mode,
            mosaic_blocks_x=mosaic_blocks_x,
            mosaic_blocks_y=mosaic_blocks_y,
            mosaic_charsets=mosaic_charsets,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    frames = [GifAsciiFrame(index=i, ascii_art=frame)
              for i, frame in enumerate(frames_ascii)]

    return GifAsciiResponse(
        frames=frames,
        frame_count=len(frames),
        fps=fps,
        width=out_width,
        height=out_height,
    )


@router.post("/image/render")
async def render_image_ascii_png(
    file: UploadFile = File(...),
    width: int = Form(120),
    charset: str = Form("@%#*+=-:. "),
    invert: bool = Form(False),
    auto_quality: bool = Form(False),
    mosaic_mode: bool = Form(False),
    mosaic_blocks_x: int = Form(3),
    mosaic_blocks_y: int = Form(3),
    mosaic_charsets: str = Form(""),
) -> StreamingResponse:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image format")

    try:
        content = await file.read()
        image = Image.open(BytesIO(content)).convert("RGB")
    except UnidentifiedImageError as error:
        raise HTTPException(
            status_code=400, detail="Invalid image file") from error

    if auto_quality:
        width, charset, invert = infer_ascii_settings(image)

    try:
        ascii_art, _, _ = image_to_ascii(
            image,
            width=width,
            charset=charset,
            invert=invert,
            mosaic_mode=mosaic_mode,
            mosaic_blocks_x=mosaic_blocks_x,
            mosaic_blocks_y=mosaic_blocks_y,
            mosaic_charsets=mosaic_charsets,
        )
        png_bytes = ascii_to_png_bytes(ascii_art)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return StreamingResponse(
        png_bytes,
        media_type="image/png",
        headers={"Content-Disposition": "attachment; filename=ascii-image.png"},
    )


@router.post("/gif/render")
async def render_gif_ascii_gif(
    file: UploadFile = File(...),
    width: int = Form(120),
    charset: str = Form("@%#*+=-:. "),
    invert: bool = Form(False),
    auto_quality: bool = Form(False),
    mosaic_mode: bool = Form(False),
    mosaic_blocks_x: int = Form(3),
    mosaic_blocks_y: int = Form(3),
    mosaic_charsets: str = Form(""),
) -> StreamingResponse:
    if file.content_type != ALLOWED_GIF_TYPE:
        raise HTTPException(status_code=400, detail="Unsupported GIF format")

    try:
        content = await file.read()
        gif_image = Image.open(BytesIO(content))
    except UnidentifiedImageError as error:
        raise HTTPException(
            status_code=400, detail="Invalid GIF file") from error

    if auto_quality:
        preview_frame = gif_image.convert("RGB")
        width, charset, invert = infer_ascii_settings(preview_frame)

    try:
        frames_ascii, _, _, fps = gif_to_ascii_frames(
            gif_image,
            width=width,
            charset=charset,
            invert=invert,
            mosaic_mode=mosaic_mode,
            mosaic_blocks_x=mosaic_blocks_x,
            mosaic_blocks_y=mosaic_blocks_y,
            mosaic_charsets=mosaic_charsets,
            max_frames=120,
        )
        gif_bytes = ascii_frames_to_gif_bytes(frames_ascii, fps)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return StreamingResponse(
        gif_bytes,
        media_type="image/gif",
        headers={"Content-Disposition": "attachment; filename=ascii-animation.gif"},
    )
