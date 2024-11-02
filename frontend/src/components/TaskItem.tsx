import React, { useState } from "react";
import { Draggable, DraggableProvided } from "react-beautiful-dnd";

interface Task {
    id: number;
    title: string;
    description: string;
    status: "Todo" | "In-Progress" | "Completed";
    children: Task[];
}

interface TaskItemProps {
    task: Task;
    index: number;
    onUpdate: (task: Task) => void;
    onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
    task,
    index,
    onUpdate,
    onDelete,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState(task);

    if (!task || typeof task.id === "undefined") {
        return null;
    }

    const handleUpdate = () => {
        onUpdate(editedTask);
        setIsEditing(false);
    };

    return (
        <Draggable draggableId={task.id.toString()} index={index}>
            {(provided: DraggableProvided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="task-item"
                >
                    {isEditing ? (
                        <div>
                            <input
                                type="text"
                                value={editedTask.title}
                                onChange={(e) =>
                                    setEditedTask({
                                        ...editedTask,
                                        title: e.target.value,
                                    })
                                }
                            />
                            <input
                                type="text"
                                value={editedTask.description}
                                onChange={(e) =>
                                    setEditedTask({
                                        ...editedTask,
                                        description: e.target.value,
                                    })
                                }
                            />
                            <select
                                value={editedTask.status}
                                onChange={(e) =>
                                    setEditedTask({
                                        ...editedTask,
                                        status: e.target
                                            .value as Task["status"],
                                    })
                                }
                            >
                                <option value="Todo">Todo</option>
                                <option value="In-Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <button onClick={handleUpdate}>Save</button>
                            <button onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div>
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <p>
                                Status:{" "}
                                <span
                                    className={`task-status status-${task.status.toLowerCase()}`}
                                >
                                    {task.status}
                                </span>
                            </p>
                            <div className="task-controls">
                                <button onClick={() => setIsEditing(true)}>
                                    Edit
                                </button>
                                <button onClick={() => onDelete(task.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                    {task.children && task.children.length > 0 && (
                        <div className="subtasks">
                            {task.children.map((subtask, subtaskIndex) => (
                                <TaskItem
                                    key={subtask.id}
                                    task={subtask}
                                    index={subtaskIndex}
                                    onUpdate={onUpdate}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default TaskItem;
