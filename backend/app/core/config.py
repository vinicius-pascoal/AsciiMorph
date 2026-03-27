from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "AsciiMorph API"
    app_version: str = "0.1.0"
    api_prefix: str = "/api/v1"
    frontend_origin: str = "http://localhost:3000"


settings = Settings()
