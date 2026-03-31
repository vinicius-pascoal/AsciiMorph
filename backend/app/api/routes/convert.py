from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image, UnidentifiedImageError

from app.schemas.responses import GifAsciiFrame, GifAsciiResponse, ImageAsciiResponse
from app.services.ascii_render import ascii_frames_to_gif_bytes, ascii_to_png_bytes
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
) -> ImageAsciiResponse:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image format")

    try:
        content = await file.read()
        image = Image.open(BytesIO(content)).convert("RGB")
    except UnidentifiedImageError as error:
        raise HTTPException(
            status_code=400, detail="Invalid image file") from error

    try:
        ascii_art, out_width, out_height = image_to_ascii(
            image,
            width=width,
            charset=charset,
            invert=invert,
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
) -> GifAsciiResponse:
    if file.content_type != ALLOWED_GIF_TYPE:
        raise HTTPException(status_code=400, detail="Unsupported GIF format")

    try:
        content = await file.read()
        gif_image = Image.open(BytesIO(content))
    except UnidentifiedImageError as error:
        raise HTTPException(
            status_code=400, detail="Invalid GIF file") from error

    try:
        frames_ascii, out_width, out_height, fps = gif_to_ascii_frames(
            gif_image,
            width=width,
            charset=charset,
            invert=invert,
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
) -> StreamingResponse:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image format")

    try:
        content = await file.read()
        image = Image.open(BytesIO(content)).convert("RGB")
    except UnidentifiedImageError as error:
        raise HTTPException(
            status_code=400, detail="Invalid image file") from error

    try:
        ascii_art, _, _ = image_to_ascii(
            image,
            width=width,
            charset=charset,
            invert=invert,
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
) -> StreamingResponse:
    if file.content_type != ALLOWED_GIF_TYPE:
        raise HTTPException(status_code=400, detail="Unsupported GIF format")

    try:
        content = await file.read()
        gif_image = Image.open(BytesIO(content))
    except UnidentifiedImageError as error:
        raise HTTPException(
            status_code=400, detail="Invalid GIF file") from error

    try:
        frames_ascii, _, _, fps = gif_to_ascii_frames(
            gif_image,
            width=width,
            charset=charset,
            invert=invert,
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
