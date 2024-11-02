import React, { useState } from "react";
import { Draggable, DraggableProvided } from "react-beautiful-dnd";

interface Task {
    id: number;
    title: string;
    description: string;
    status: "Todo" | "In-Progress" | "Completed";
    children: Task[];
    parent_id: number | null;
    depth: number;
}

interface TaskItemProps {
    task: Task;
    index: number;
    onUpdate: (task: Task) => void;
    onDelete: (id: number) => void;
    onAddSubtask: (title: string, description: string) => void;
    depth: number;
}

export default function TaskItem({
    task,
    index,
    onUpdate,
    onDelete,
    onAddSubtask,
    depth,
}: TaskItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState(task);
    const [showAddSubtask, setShowAddSubtask] = useState(false);
    const [newSubtask, setNewSubtask] = useState({
        title: "",
        description: "",
    });

    const handleUpdate = () => {
        onUpdate(editedTask);
        setIsEditing(false);
    };

    const handleAddSubtask = () => {
        if (depth < 2 && newSubtask.title.trim() !== "") {
            onAddSubtask(newSubtask.title, newSubtask.description);
            setNewSubtask({ title: "", description: "" });
            setShowAddSubtask(false);
        }
    };

    return (
        <Draggable draggableId={task.id.toString()} index={index}>
            {(provided: DraggableProvided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-4 p-4 bg-white shadow-md rounded-lg task-item"
                >
                    {isEditing ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={editedTask.title}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                    setEditedTask({
                                        ...editedTask,
                                        title: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded mb-2"
                            />
                            <input
                                type="text"
                                value={editedTask.description}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                    setEditedTask({
                                        ...editedTask,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded mb-2"
                            />
                            <select
                                value={editedTask.status}
                                onChange={(
                                    e: React.ChangeEvent<HTMLSelectElement>
                                ) =>
                                    setEditedTask({
                                        ...editedTask,
                                        status: e.target
                                            .value as Task["status"],
                                    })
                                }
                                className="w-full p-2 border rounded mb-2"
                            >
                                <option value="Todo">Todo</option>
                                <option value="In-Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <button
                                onClick={handleUpdate}
                                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">
                                {task.title}
                            </h3>
                            <p className="text-gray-600 mb-2">
                                {task.description}
                            </p>
                            <p className="mb-2">
                                Status:{" "}
                                <span
                                    className={`inline-block px-2 py-1 rounded text-white ${
                                        task.status === "Todo"
                                            ? "bg-blue-500"
                                            : task.status === "In-Progress"
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                    }`}
                                >
                                    {task.status}
                                </span>
                            </p>
                            <p className="mb-2">Depth: {depth}</p>
                            <p className="mb-4">
                                Parent ID:{" "}
                                {task.parent_id !== null
                                    ? task.parent_id
                                    : "None"}
                            </p>
                            <div className="space-x-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(task.id)}
                                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                                {depth < 2 && (
                                    <button
                                        onClick={() =>
                                            setShowAddSubtask(!showAddSubtask)
                                        }
                                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                                    >
                                        {showAddSubtask
                                            ? "Cancel"
                                            : "Add Subtask"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {showAddSubtask && (
                        <div className="mt-4 space-y-2">
                            <input
                                type="text"
                                placeholder="Subtask title"
                                value={newSubtask.title}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                    setNewSubtask({
                                        ...newSubtask,
                                        title: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Subtask description"
                                value={newSubtask.description}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                    setNewSubtask({
                                        ...newSubtask,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded mb-2"
                            />
                            <button
                                onClick={handleAddSubtask}
                                className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                            >
                                Add Subtask
                            </button>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
}
