from flask import Blueprint, request, jsonify
from app import db  # Import the database instance
from app.models import Task, User  # Import Task and User models
from flask_jwt_extended import jwt_required, get_jwt_identity  # Import JWT functions

# Create a Blueprint for task-related routes
tasks = Blueprint("tasks", __name__)

VALID_STATUSES = ["Todo", "In-Progress", "Completed"]  # List of valid task statuses


# Recursive function to build task tree structure
def get_task_tree(task):
    task_dict = task.to_dict()
    task_dict["children"] = [get_task_tree(child) for child in task.children]
    return task_dict


# Route to get all tasks for the current user
@tasks.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    current_user_id = get_jwt_identity()  # Get the user ID from JWT
    root_tasks = Task.query.filter_by(user_id=current_user_id, parent_id=None).all()
    return jsonify([get_task_tree(task) for task in root_tasks]), 200


# Route to create a new task for the current user
@tasks.route("/tasks", methods=["POST"])
@jwt_required()
def create_task():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Ensure task title is provided
    if not data.get("title"):
        return jsonify({"message": "Title is required"}), 400

    # Handle optional parent task and depth check
    parent_id = data.get("parent_id")
    if parent_id is not None:
        parent_task = Task.query.filter_by(
            id=parent_id, user_id=current_user_id
        ).first()
        if not parent_task:
            return jsonify({"message": "Parent task not found"}), 404

        # Check task hierarchy depth
        depth = 0
        current = parent_task
        while current.parent_id is not None:
            depth += 1
            current = current.parent
        if depth >= 2:
            return jsonify({"message": "Maximum depth reached"}), 400

    # Validate task status
    status = data.get("status", "Todo")
    if status not in VALID_STATUSES:
        return (
            jsonify(
                {
                    "message": f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"
                }
            ),
            400,
        )

    # Create and save the new task
    new_task = Task(
        title=data["title"],
        description=data.get("description", ""),
        status=status,
        parent_id=parent_id,
        user_id=current_user_id,
    )
    db.session.add(new_task)
    db.session.commit()

    return jsonify(get_task_tree(new_task)), 201


# Route to update an existing task
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

    # Update task status if provided and valid
    new_status = data.get("status")
    if new_status:
        if new_status not in VALID_STATUSES:
            return (
                jsonify(
                    {
                        "message": f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"
                    }
                ),
                400,
            )
        task.status = new_status

    # Update parent task if provided and valid
    new_parent_id = data.get("parent_id")
    if new_parent_id is not None:
        if new_parent_id == 0:
            task.parent_id = None
        else:
            new_parent = Task.query.filter_by(
                id=new_parent_id, user_id=current_user_id
            ).first()
            if not new_parent:
                return jsonify({"message": "New parent task not found"}), 404

            # Check depth for new parent task
            depth = 0
            current = new_parent
            while current.parent_id is not None:
                depth += 1
                current = current.parent
            if depth >= 2:
                return jsonify({"message": "Maximum depth reached"}), 400

            task.parent_id = new_parent_id

    db.session.commit()

    return jsonify(get_task_tree(task)), 200


# Route to delete a task and its subtasks
@tasks.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    current_user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()

    if not task:
        return jsonify({"message": "Task not found"}), 404

    try:
        # Recursive function to delete all subtasks
        def delete_subtasks(task):
            for subtask in task.children:
                delete_subtasks(subtask)
            db.session.delete(task)

        delete_subtasks(task)
        db.session.commit()
        return (
            jsonify(
                {
                    "message": "Task and all subtasks deleted successfully",
                    "deleted_id": task_id,
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        db.session.rollback()
        return (
            jsonify(
                {"message": "Failed to delete task. Please try again.", "error": str(e)}
            ),
            500,
        )
