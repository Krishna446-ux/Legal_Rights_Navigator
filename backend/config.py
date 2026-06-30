from pydantic_settings import BaseSettings,SettingsConfigDict

class Settings(BaseSettings):
    google_client_id:str
    google_client_secret:str
    database_url:str
    environment: str = "development"
    cors_origins: list[str] = ["http://localhost:3000"]
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

setting=Settings() 