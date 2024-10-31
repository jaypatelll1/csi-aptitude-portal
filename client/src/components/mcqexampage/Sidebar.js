// Sidebar.js
import React from 'react';
import '../../styles/Sidebar.css';

const Sidebar = ({ userName, attempted, remaining, timeLeft, questions }) => {
  return (
    <div className="sidebar">
      <div className="user-info">
        <h3>{userName}</h3>
        <p>Attempted: {attempted}</p>
        <p>Remaining: {remaining}</p>
        <div className="timer">{timeLeft}</div>
      </div>
      
      <div className="questions-grid">
        {questions.map((status, index) => (
          <div
            key={index}
            className={`question-box ${status}`}
            title={`Question ${index + 1}`}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <button className="submit-button">Submit Exam</button>
    </div>
  );
};

export default Sidebar;
