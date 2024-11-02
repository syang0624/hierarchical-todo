import os
from datetime import timedelta


# Configuration class for the Flask application
class Config:
    # Secret key for session management and CSRF protection
    SECRET_KEY = os.environ.get("SECRET_KEY") or "you-will-never-guess"

    # Database URI, defaulting to SQLite if no environment variable is set
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "sqlite:///database.db"

    # Disable SQLAlchemy modification tracking to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Secret key for JWT token creation
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "jwt-secret-string"

    # Set expiration time for JWT access tokens
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
