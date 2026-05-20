from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql://nutritrack:nutritrack_pass@localhost:5432/nutritrack"
    jwt_secret: str = "change_me_to_a_long_random_string_at_least_32_chars"
    # Comma-separated list of allowed CORS origins, e.g.:
    # http://localhost:3000,https://yourdomain.com,https://your-app.vercel.app
    admin_cors_origin: str = "http://localhost:3000"
    log_level: str = "info"

    @field_validator("database_url", mode="before")
    @classmethod
    def normalise_db_scheme(cls, v: str) -> str:
        # Railway (and some other providers) supply postgres:// which SQLAlchemy 2.x rejects.
        if isinstance(v, str) and v.startswith("postgres://"):
            return "postgresql://" + v[len("postgres://"):]
        return v

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.admin_cors_origin.split(",") if o.strip()]


settings = Settings()
