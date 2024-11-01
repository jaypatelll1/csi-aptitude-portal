import React from 'react';
import '../../styles/Sidebar.css';
import clockIcon from '../../assets/sidebar/stopwatch.png';
const Sidebar = ({ userName, timeLeft, questionsStatus, onQuestionSelect }) => {
  return (
    <div className="sidebar">
      <div className="timer-cnt">
        <div className="timer">
        <img src={clockIcon} alt="Clock Icon" className="clock-icon" /> {timeLeft}
        </div>
      </div>
      <h3 className="Questions-txt">Questions</h3>
      <div className="legend">
        <div className="legend-item answered">
          <span className="legend-color-box"></span> Answered
        </div>
        <div className="legend-item visited">
          <span className="legend-color-box"></span> Visited
        </div>
        <div className="legend-item unanswered">
          <span className="legend-color-box"></span> Unanswered
        </div>
      </div>
      <div className="questions-list">
        {questionsStatus.map((status, index) => (
          <div
            key={index}
            className={`question-box ${
              status?.status === 'answered'
                ? 'answered'
                : status?.status === 'visited'
                ? 'visited'
                : 'unanswered'
            }`}
            onClick={() => onQuestionSelect(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
