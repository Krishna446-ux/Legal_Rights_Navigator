from pydantic_settings import BaseSettings,SettingsConfigDict
from pydantic import SecretStr

class Settings(BaseSettings):
    google_client_id:str
    google_client_secret:str
    google_redirect_uri:str
    database_url:str
    checkpoint_database_url:str
    environment: str = "development"
    frontend_url:str
    jwt_secret_key:str
    cors_origins: list[str] = ["http://127.0.0.1:3000"]
    HF_TOKEN:str
    GROQ_API_KEY: SecretStr
    GOOGLE_API_KEY: SecretStr
    MISTRAL_API_KEY: SecretStr
    OPENAI_API_KEY: SecretStr
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

setting=Settings() 