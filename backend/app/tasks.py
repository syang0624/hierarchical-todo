from flask import Blueprint, request, jsonify
from app import db
from app.models import Task, User
from flask_jwt_extended import jwt_required, get_jwt_identity

tasks = Blueprint("tasks", __name__)


@tasks.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    current_user_id = get_jwt_identity()
    tasks = Task.query.filter_by(user_id=current_user_id, parent_id=None).all()
    return jsonify([task.to_dict() for task in tasks]), 200


@tasks.route("/tasks", methods=["POST"])
@jwt_required()
def create_task():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    new_task = Task(
        title=data["title"],
        description=data.get("description", ""),
        status=data.get("status", "Todo"),
        parent_id=data.get("parent_id"),
        user_id=current_user_id,
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify(new_task.to_dict()), 201


@tasks.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    current_user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()

    if not task:
        return jsonify({"message": "Task not found"}), 404

    data = request.get_json()
    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    task.status = data.get("status", task.status)
    task.parent_id = data.get("parent_id", task.parent_id)

    db.session.commit()

    return jsonify(task.to_dict()), 200


@tasks.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    current_user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()

    if not task:
        return jsonify({"message": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "Task deleted successfully"}), 200
