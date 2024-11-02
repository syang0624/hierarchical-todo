from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from .config import Config
from flask_cors import CORS

db = SQLAlchemy()
bcrypt = Bcrypt()


def create_app(config_class=Config):
    app = Flask(__name__)
    CORS(app)  # Add this line
    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)

    from .routes import main

    app.register_blueprint(main)

    return app
