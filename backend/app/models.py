from app import db, bcrypt  # Import database instance and bcrypt for password hashing
from datetime import datetime  # Import datetime for timestamping if needed in future


# User model representing users in the database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for each user
    email = db.Column(
        db.String(120), index=True, unique=True
    )  # User email with unique constraint
    password = db.Column(db.String(128))  # Hashed password storage
    tasks = db.relationship(
        "Task", backref="owner", lazy="dynamic"
    )  # Relationship to tasks owned by the user

    def set_password(self, password):
        # Hash and store password
        self.password = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        # Verify hashed password
        return bcrypt.check_password_hash(self.password, password)


# Task model representing tasks associated with users
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Unique identifier for each task
    title = db.Column(db.String(100), nullable=False)  # Title of the task
    description = db.Column(db.Text)  # Detailed task description
    status = db.Column(
        db.Enum("Todo", "In-Progress", "Completed", name="task_status"), default="Todo"
    )  # Task status with default value
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=False
    )  # Foreign key to associate task with a user
    parent_id = db.Column(
        db.Integer, db.ForeignKey("task.id")
    )  # Self-referential foreign key for hierarchical tasks
    children = db.relationship(
        "Task", backref=db.backref("parent", remote_side=[id])
    )  # Relationship for subtasks

    def to_dict(self):
        # Return task details as a dictionary
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "user_id": self.user_id,
            "parent_id": self.parent_id,
        }
