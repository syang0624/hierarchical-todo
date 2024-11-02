# Import necessary modules and functions
from flask import Blueprint, request, jsonify
from app.models import User  # Import User model
from app import db  # Import database instance
from flask_jwt_extended import (
    create_access_token,
)  # Import function to create JWT access token

# Create a Blueprint for authentication routes
auth = Blueprint("auth", __name__)


# Route for user signup
@auth.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()  # Get JSON data from request
    email = data.get("email")  # Extract email
    password = data.get("password")  # Extract password

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    # Create new user and set password
    new_user = User(email=email)
    new_user.set_password(password)
    db.session.add(new_user)  # Add new user to session
    db.session.commit()  # Commit to save new user

    return jsonify({"message": "User created successfully"}), 201  # Success response


# Route for user login
@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()  # Get JSON data from request

    # Retrieve user by email
    user = User.query.filter_by(email=data.get("email")).first()

    # Verify password and generate access token if valid
    if user and user.check_password(data.get("password")):
        access_token = create_access_token(identity=user.id)  # Generate JWT token
        return jsonify(access_token=access_token), 200  # Success response
    else:
        return (
            jsonify({"message": "Invalid email or password"}),
            401,
        )  # Error response if login fails
