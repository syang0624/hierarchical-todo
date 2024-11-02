import React, { useState } from "react";
import axios from "axios";

interface AuthProps {
    onLogin: (token: string) => void;
}

const API_URL = "http://127.0.0.1:5000";

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setIsSuccess(false);

        try {
            const endpoint = activeTab === "login" ? "/login" : "/signup";
            const data = { email, password };

            const response = await axios.post(`${API_URL}${endpoint}`, data);
            setMessage(response.data.message);
            setIsSuccess(true);
            if (activeTab === "login" && response.data.access_token) {
                onLogin(response.data.access_token);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage("An error occurred. Please try again.");
            }
            setIsSuccess(false);
        }
    };

    return (
        <div className="form-container">
            <div className="tabs">
                <button
                    className={`tab ${activeTab === "login" ? "active" : ""}`}
                    onClick={() => setActiveTab("login")}
                >
                    Login
                </button>
                <button
                    className={`tab ${activeTab === "signup" ? "active" : ""}`}
                    onClick={() => setActiveTab("signup")}
                >
                    Sign Up
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="submit-btn">
                    {activeTab === "login" ? "Login" : "Sign Up"}
                </button>
            </form>
            {message && (
                <div className={`message ${isSuccess ? "success" : "error"}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default Auth;
