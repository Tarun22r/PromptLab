"""
Application configuration.

All configuration is sourced from environment variables (see .env.example).
No secrets are ever hard-coded or exposed to the frontend — the API key,
if present, is only ever read on the backend process.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "PromptLab API"
    database_url: str = "sqlite:///./promptlab.db"

    # LLM provider configuration. If llm_api_key is empty, the app runs in
    # Demo Mode automatically — this is a deliberate product decision so
    # the app is fully explorable without any credentials configured.
    llm_provider: str = "openai"
    llm_api_key: str = ""
    llm_base_url: str = "https://api.openai.com/v1"
    llm_default_model: str = "gpt-4o-mini"

    cors_origins: list[str] = ["http://localhost:5173"]

    @property
    def demo_mode(self) -> bool:
        return not bool(self.llm_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
