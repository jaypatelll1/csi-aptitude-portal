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
    
    # API Keys
    GROQ_API_KEY: str = field(default_factory=lambda: os.getenv('GROQ_API_KEY'))
    DEEPSEEK_API_KEY: str = field(default_factory=lambda: os.getenv('DEEPSEEK_API_KEY'))
    
    # Database
    MONGODB_URI: str = field(default_factory=lambda: os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
    MONGODB_DB_NAME: str = field(default_factory=lambda: os.getenv('MONGODB_DB_NAME', 'ip_guardian'))
    
    # API Models
    GROQ_MODEL: str = field(default_factory=lambda: os.getenv('GROQ_MODEL', 'mixtral-8x7b-32768'))
    DEEPSEEK_MODEL: str = field(default_factory=lambda: os.getenv('DEEPSEEK_MODEL', 'deepseek-chat'))
    DEEPSEEK_BASE_URL: str = field(default_factory=lambda: os.getenv('DEEPSEEK_BASE_URL', 'https://api.deepseek.com'))
    
    # Analysis Settings
    ANALYSIS_ENGINE: str = field(default_factory=lambda: os.getenv('ANALYSIS_ENGINE', 'hybrid'))  # 'groq', 'deepseek', 'hybrid'
    CACHE_TTL: int = field(default_factory=lambda: int(os.getenv('CACHE_TTL', '3600')))
    RATE_LIMIT_PER_MINUTE: int = field(default_factory=lambda: int(os.getenv('RATE_LIMIT_PER_MINUTE', '60')))
    ALLOWED_ORIGINS: List[str] = field(default_factory=lambda: os.getenv('ALLOWED_ORIGINS', '*').split(','))
    
    # Advanced Analysis Settings
    MIN_CONFIDENCE_THRESHOLD: float = field(default_factory=lambda: float(os.getenv('MIN_CONFIDENCE_THRESHOLD', '0.7')))
    MAX_LOG_SIZE: int = field(default_factory=lambda: int(os.getenv('MAX_LOG_SIZE', '100000')))
    ENABLE_BEHAVIORAL_ANALYSIS: bool = field(default_factory=lambda: os.getenv('ENABLE_BEHAVIORAL_ANALYSIS', 'True').lower() in ['true', '1', 'yes'])

    @classmethod
    def validate(cls) -> bool:
        """Validate configuration settings"""
        instance = cls()
        
        # Check if at least one API key is provided
        if not instance.GROQ_API_KEY and not instance.DEEPSEEK_API_KEY:
            print("Error: At least one API key (GROQ_API_KEY or DEEPSEEK_API_KEY) is required")
            return False
            
        # Validate analysis engine setting
        valid_engines = ['groq', 'deepseek', 'hybrid']
        if instance.ANALYSIS_ENGINE not in valid_engines:
            print(f"Error: ANALYSIS_ENGINE must be one of: {valid_engines}")
            return False
            
        return True

# Create a singleton instance
config = Config()
