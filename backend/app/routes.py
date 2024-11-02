from flask import Blueprint, request, jsonify
from app.models import User
from app import db

main = Blueprint("main", __name__)


@main.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    new_user = User(email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201


@main.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    user = User.query.filter_by(email=data.get("email")).first()

    if user and user.check_password(data.get("password")):
        return jsonify({"message": "Logged in successfully"}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401
