import React from "react";
import TaskList from "../components/TaskList";

interface DashboardProps {
    token: string;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
    return (
        <div className="dashboard">
            <h1>Task Dashboard</h1>
            <TaskList token={token} />
        </div>
    );
};

export default Dashboard;
