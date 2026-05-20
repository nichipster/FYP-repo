from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql://nutritrack:nutritrack_pass@localhost:5432/nutritrack"
    jwt_secret: str = "change_me_to_a_long_random_string_at_least_32_chars"
    admin_cors_origin: str = "http://localhost:3000"
    log_level: str = "info"


settings = Settings()
