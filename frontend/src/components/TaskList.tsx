import React, { useState, useEffect } from "react";
import {
    DragDropContext,
    Droppable,
    DropResult,
    DroppableProvided,
} from "react-beautiful-dnd";
import axios from "axios";
import TaskItem from "./TaskItem";

interface Task {
    id: number;
    title: string;
    description: string;
    status: "Todo" | "In-Progress" | "Completed";
    children: Task[];
    parent_id: number | null;
    depth: number;
}

interface TaskListProps {
    token: string;
}

const API_URL = "http://127.0.0.1:5000";

export default function TaskList({ token }: TaskListProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        parent_id: null as number | null,
    });
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${API_URL}/tasks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const tasksWithDepth = addDepthToTasks(response.data);
            setTasks(tasksWithDepth);
            setError(null);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setError("Failed to fetch tasks. Please try again.");
        }
    };

    const addDepthToTasks = (tasks: Task[], depth: number = 0): Task[] => {
        return tasks.map((task) => ({
            ...task,
            depth,
            children: addDepthToTasks(task.children, depth + 1),
        }));
    };

    const handleAddTask = async (
        parentId: number | null = null,
        title: string,
        description: string
    ) => {
        try {
            const taskToAdd = { title, description, parent_id: parentId };
            const response = await axios.post(`${API_URL}/tasks`, taskToAdd, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const newTaskWithDepth = addDepthToTasks([response.data])[0];
            if (parentId) {
                setTasks((prevTasks) =>
                    updateTasksRecursively(prevTasks, parentId, (parent) => ({
                        ...parent,
                        children: [...parent.children, newTaskWithDepth],
                    }))
                );
            } else {
                setTasks((prevTasks) => [...prevTasks, newTaskWithDepth]);
            }
            setNewTask({ title: "", description: "", parent_id: null });
            setError(null);
            setSuccessMessage("Task added successfully");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Error adding task:", error);
            setError("Failed to add task. Please try again.");
        }
    };

    const handleUpdateTask = async (updatedTask: Task) => {
        try {
            const response = await axios.put(
                `${API_URL}/tasks/${updatedTask.id}`,
                {
                    title: updatedTask.title,
                    description: updatedTask.description,
                    status: updatedTask.status,
                    parent_id: updatedTask.parent_id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedTaskWithChildren = addDepthToTasks([response.data])[0];
            setTasks((prevTasks) =>
                updateTasksRecursively(
                    prevTasks,
                    updatedTask.id,
                    () => updatedTaskWithChildren
                )
            );
            setError(null);
            setSuccessMessage("Task updated successfully");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Error updating task:", error);
            setError("Failed to update task. Please try again.");
        }
    };

    const updateTasksRecursively = (
        taskList: Task[],
        id: number,
        updateFn: (task: Task) => Task
    ): Task[] => {
        return taskList.map((task) => {
            if (task.id === id) {
                return updateFn(task);
            }
            if (task.children.length > 0) {
                return {
                    ...task,
                    children: updateTasksRecursively(
                        task.children,
                        id,
                        updateFn
                    ),
                };
            }
            return task;
        });
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            const response = await axios.delete(`${API_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                setTasks((prevTasks) => removeTaskFromList(prevTasks, taskId));
                setSuccessMessage("Task deleted successfully");
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                throw new Error("Unexpected response status");
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            setError("Failed to delete task. Please try again.");
        }
    };

    const removeTaskFromList = (taskList: Task[], taskId: number): Task[] => {
        return taskList
            .filter((task) => task.id !== taskId)
            .map((task) => ({
                ...task,
                children: removeTaskFromList(task.children, taskId),
            }));
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const updatedTask = findTaskById(parseInt(draggableId), tasks);
        if (updatedTask) {
            const newParentId = parseInt(destination.droppableId);
            if (!isNaN(newParentId)) {
                const newParent = findTaskById(newParentId, tasks);
                if (newParent && newParent.depth < 2) {
                    updatedTask.parent_id = newParentId;
                    updatedTask.depth = newParent.depth + 1;
                } else {
                    return; // Cannot move to a task that's already at max depth
                }
            } else {
                updatedTask.parent_id = null;
                updatedTask.depth = 0;
            }
            updatedTask.status = destination.droppableId as Task["status"];
            await handleUpdateTask(updatedTask);
        }
    };

    const findTaskById = (id: number, taskList: Task[]): Task | undefined => {
        for (const task of taskList) {
            if (task.id === id) {
                return task;
            }
            if (task.children.length > 0) {
                const foundTask = findTaskById(id, task.children);
                if (foundTask) {
                    return foundTask;
                }
            }
        }
        return undefined;
    };

    const renderTasks = (taskList: Task[]) => {
        return taskList.map((task, index) => (
            <React.Fragment key={task.id}>
                <TaskItem
                    task={task}
                    index={index}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    onAddSubtask={(title, description) =>
                        handleAddTask(task.id, title, description)
                    }
                    depth={task.depth}
                />
                {task.children.length > 0 && task.depth < 2 && (
                    <Droppable
                        droppableId={task.id.toString()}
                        type={`list-${task.depth + 1}`}
                    >
                        {(provided: DroppableProvided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`subtasks depth-${task.depth + 1}`}
                            >
                                {renderTasks(task.children)}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                )}
            </React.Fragment>
        ));
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="task-list w-full max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Tasks</h2>
                {error && (
                    <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                        role="alert"
                    >
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div
                        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
                        role="alert"
                    >
                        {successMessage}
                    </div>
                )}
                <div className="add-task-form mb-6">
                    <input
                        type="text"
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewTask({ ...newTask, title: e.target.value })
                        }
                        className="w-full p-2 border rounded mb-2"
                    />
                    <input
                        type="text"
                        placeholder="Task description"
                        value={newTask.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewTask({
                                ...newTask,
                                description: e.target.value,
                            })
                        }
                        className="w-full p-2 border rounded mb-2"
                    />
                    <button
                        onClick={() =>
                            handleAddTask(
                                null,
                                newTask.title,
                                newTask.description
                            )
                        }
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Add Task
                    </button>
                </div>
                <div className="task-columns grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["Todo", "In-Progress", "Completed"].map((status) => (
                        <Droppable
                            key={status}
                            droppableId={status}
                            type="list-0"
                        >
                            {(provided: DroppableProvided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="task-column bg-gray-100 p-4 rounded-lg"
                                >
                                    <h3 className="text-lg font-semibold mb-4">
                                        {status}
                                    </h3>
                                    {renderTasks(
                                        tasks.filter(
                                            (task) =>
                                                task.status === status &&
                                                task.parent_id === null
                                        )
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </div>
        </DragDropContext>
    );
}
