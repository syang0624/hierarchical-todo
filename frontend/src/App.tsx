import React, { useState } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import "./App.css";

const App: React.FC = () => {
    const [token, setToken] = useState("");

    const handleLogin = (newToken: string) => {
        setToken(newToken);
    };

    const handleLogout = () => {
        setToken("");
    };

    return (
        <div className="container">
            {!token ? (
                <Auth onLogin={handleLogin} />
            ) : (
                <>
                    <nav className="app-nav">
                        <h1>Hierarchical Todo App</h1>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </nav>
                    <Dashboard token={token} />
                </>
            )}
        </div>
    );
};

export default App;
