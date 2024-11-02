# Import necessary Flask modules and extensions for app creation and configuration
from flask import Flask
from flask_bcrypt import Bcrypt  # Import for password hashing
from flask_sqlalchemy import SQLAlchemy  # Import for database management
from flask_cors import CORS  # Import for handling Cross-Origin Resource Sharing
from flask_jwt_extended import (
    JWTManager,
)  # Import for handling JSON Web Tokens for authentication
from .config import Config  # Import configuration settings from config file

# Initialize extensions without attaching them to the app yet
db = SQLAlchemy()  # Initialize SQLAlchemy database instance
jwt = JWTManager()  # Initialize JWT manager for authentication handling
bcrypt = Bcrypt()  # Initialize Bcrypt for password hashing


def create_app(config_class=Config):
    # Create a new Flask application instance
    app = Flask(__name__)
    # Load configuration settings from the provided Config class
    app.config.from_object(Config)

    # Initialize the extensions with the app instance
    db.init_app(app)  # Bind SQLAlchemy to the Flask app
    CORS(app)  # Enable CORS to handle requests from different origins
    jwt.init_app(app)  # Set up JWT for secure authentication

    # Import and register Blueprints for organizing routes
    from .auth import auth  # Import authentication blueprint
    from .tasks import tasks  # Import tasks blueprint

    app.register_blueprint(auth)  # Register auth blueprint for authentication routes
    app.register_blueprint(tasks)  # Register tasks blueprint for task management routes

    # Return the configured Flask app instance
    return app
