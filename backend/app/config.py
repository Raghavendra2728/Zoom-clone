from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Zoom Clone API"
    APP_VERSION: str = "1.0.0"

    DATABASE_URL: str = "sqlite:///./meetings.db"

    FRONTEND_URL: str = "http://localhost:3000"

    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()