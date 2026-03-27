from pydantic import BaseModel, Field


class ImageAsciiResponse(BaseModel):
    ascii_art: str = Field(..., description="ASCII result for a static image")
    width: int
    height: int


class GifAsciiFrame(BaseModel):
    index: int
    ascii_art: str


class GifAsciiResponse(BaseModel):
    frames: list[GifAsciiFrame]
    frame_count: int
    fps: int
    width: int
    height: int
