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
}

interface TaskListProps {
    token: string;
}

const API_URL = "http://127.0.0.1:5000";

const TaskList: React.FC<TaskListProps> = ({ token }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        parent_id: null as number | null,
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${API_URL}/tasks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(response.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setError("Failed to fetch tasks. Please try again.");
        }
    };

    const handleAddTask = async () => {
        try {
            const response = await axios.post(`${API_URL}/tasks`, newTask, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks([...tasks, response.data]);
            setNewTask({ title: "", description: "", parent_id: null });
            setError(null);
        } catch (error) {
            console.error("Error adding task:", error);
            setError("Failed to add task. Please try again.");
        }
    };

    const handleUpdateTask = async (updatedTask: Task) => {
        try {
            await axios.put(`${API_URL}/tasks/${updatedTask.id}`, updatedTask, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTasks();
        } catch (error) {
            console.error("Error updating task:", error);
            setError("Failed to update task. Please try again.");
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
            setError("Failed to delete task. Please try again.");
        }
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

        const updatedTask = tasks.find(
            (task) => task.id === parseInt(draggableId)
        );
        if (updatedTask) {
            updatedTask.status = destination.droppableId as Task["status"];
            await handleUpdateTask(updatedTask);
        }
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="task-list">
                <h2>Tasks</h2>
                <div className="add-task-form">
                    <input
                        type="text"
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={(e) =>
                            setNewTask({ ...newTask, title: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        placeholder="Task description"
                        value={newTask.description}
                        onChange={(e) =>
                            setNewTask({
                                ...newTask,
                                description: e.target.value,
                            })
                        }
                    />
                    <button onClick={handleAddTask}>Add Task</button>
                </div>
                <div className="task-columns">
                    {["Todo", "In-Progress", "Completed"].map((status) => (
                        <Droppable key={status} droppableId={status}>
                            {(provided: DroppableProvided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`task-column ${status.toLowerCase()}`}
                                >
                                    <h3>{status}</h3>
                                    {tasks
                                        .filter(
                                            (task) =>
                                                task && task.status === status
                                        )
                                        .map((task, index) => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                index={index}
                                                onUpdate={handleUpdateTask}
                                                onDelete={handleDeleteTask}
                                            />
                                        ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </div>
        </DragDropContext>
    );
};

export default TaskList;
