import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/Student/Stu_Login.css";

function Stu_login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const logPressed = async (e) => {
    e.preventDefault(); 
    try {
      const response = await axios.post(
        "https://dummyapicsi.onrender.com/api/login",
        { username: userName, password: password }
      );
      console.log("Server Response:", response);
      if (response.data.message) {
        navigate("/question");
      }
      setMessage(response.data.message);
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setMessage("Login failed. Please try again.");
    }
  };

  return (
    <div className="main">
      {/* Header Section */}
      <div className="header">
        <div>Aptitude Portal</div>
        <button onClick={() => navigate("/adi_login")}>Admin login</button>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="login-container">
          <h2>Student Login</h2>
          <form onSubmit={logPressed}>
            <input
              type="text"
              placeholder="Email"
              required
              onChange={(e) => setUserName(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Stu_login;