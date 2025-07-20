import os
from dataclasses import dataclass, field
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

@dataclass
class Config:
    SECRET_KEY: str = field(default_factory=lambda: os.getenv('SECRET_KEY', 'your-secret-key-change-in-production'))
    DEBUG: bool = field(default_factory=lambda: os.getenv('FLASK_DEBUG', 'False').lower() in ['true', '1', 'yes'])
    GROQ_API_KEY: str = field(default_factory=lambda: os.getenv('GROQ_API_KEY'))
    GROQ_MODEL: str = field(default_factory=lambda: os.getenv('GROQ_MODEL', 'mixtral-8x7b-32768'))
    CACHE_TTL: int = field(default_factory=lambda: int(os.getenv('CACHE_TTL', '3600')))
    RATE_LIMIT_PER_MINUTE: int = field(default_factory=lambda: int(os.getenv('RATE_LIMIT_PER_MINUTE', '60')))
    ALLOWED_ORIGINS: List[str] = field(default_factory=lambda: os.getenv('ALLOWED_ORIGINS', '*').split(','))
    API_KEY_HEADER: str = 'X-API-Key'

    @classmethod
    def validate(cls) -> bool:
        """Validate configuration settings"""
        instance = cls()
        if not instance.GROQ_API_KEY:
            print("Error: GROQ_API_KEY environment variable is required")
            return False
        return True

# Create a singleton instance
config = Config()
