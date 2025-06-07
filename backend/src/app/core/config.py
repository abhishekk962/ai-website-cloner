"""Configuration settings for the application."""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    hyperbrowser_api_key: str
    gemini_api_key: str

    class Config:
        """Pydantic config."""
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create a global settings instance
settings = Settings()
