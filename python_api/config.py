import os

class Config:
    # PostgreSQL database configuration
    DB_USER = os.getenv('DB_USER', 'medilocate_user')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'medilocate1@')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'medilocate')
    
    # SQLAlchemy configuration
    SQLALCHEMY_DATABASE_URI = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Flask configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-for-medilocate')
    DEBUG = True

class DevelopmentConfig(Config):
    DEBUG = True
    
class TestingConfig(Config):
    TESTING = True
    # Use SQLite for testing
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test_medilocate.db'

class ProductionConfig(Config):
    DEBUG = False
    SECRET_KEY = os.getenv('SECRET_KEY')  # Must be set in production

# Select configuration based on environment
config_by_name = {
    'dev': DevelopmentConfig,
    'test': TestingConfig,
    'prod': ProductionConfig
}

# Default configuration
default_config = config_by_name['dev'] 