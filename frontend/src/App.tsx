import React, { useState } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import "./App.css";

const App: React.FC = () => {
    const [token, setToken] = useState(""); // State to store the authentication token

    // Function to handle login by setting the token
    const handleLogin = (newToken: string) => {
        setToken(newToken);
    };

    // Function to handle logout by clearing the token
    const handleLogout = () => {
        setToken("");
    };

    return (
        <div className="container">
            {/* Render Auth component if not logged in, else render Dashboard */}
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
