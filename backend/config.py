"""
Backend Configuration - All settings for AI SkillFit
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # Database
    supabase_url: str = ""
    supabase_key: str = ""
    database_url: str = ""
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # LLM Configuration
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"
    use_ollama: bool = True
    groq_api_key: str = ""
    gemini_api_key: str = ""
    
    # Whisper Configuration
    whisper_model_size: str = "base"  # tiny, base, small, medium, large
    
    # Storage
    storage_type: str = "local"  # local or supabase
    local_storage_path: str = "./uploads"
    
    # Security
    secret_key: str = "changeme-make-this-very-long-and-random"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    
    # URLs
    app_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"
    
    # Feature Flags
    debug: bool = False
    enable_fraud_detection: bool = True
    enable_sms: bool = False  # Set to True when SMS gateway configured
    
    # Processing
    max_video_size_mb: int = 100
    max_audio_duration_seconds: int = 300
    
    # Scoring Thresholds
    job_ready_threshold: float = 7.5
    needs_training_threshold: float = 5.0
    fraud_confidence_threshold: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        env_ignore_empty = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
