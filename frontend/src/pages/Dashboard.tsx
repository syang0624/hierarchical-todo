import React from "react";
import TaskList from "../components/TaskList";

// Props for the Dashboard component
interface DashboardProps {
    token: string; // Authentication token for API requests
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
    return (
        <div className="dashboard">
            <h1>Task Dashboard</h1>
            {/* Render TaskList component with the provided token */}
            <TaskList token={token} />
        </div>
    );
};

export default Dashboard;
