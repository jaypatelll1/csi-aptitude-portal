import React from 'react';
import '../../styles/Sidebar.css';

const Sidebar = ({ userName, attempted, remaining, timeLeft, questions }) => {
  return (
    <div className="sidebar">
      <div className="user-info">
        <h3>{userName}</h3>
        <p>Attempted: {attempted}</p>
        <p>Remaining: {remaining}</p>
        <p>Time Left: {timeLeft}</p>
      </div>
      <div className="question-status">
        {questions.map((status, index) => (
          <div
            key={index}
            className={`question-box ${status === 'answered' ? 'answered' : 'unanswered'}`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
