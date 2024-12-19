// Sidebar.js
import React from 'react';
import styles from '../../../styles/Student/Sidebar.module.css';
import clockIcon from '../../../assets/sidebar/stopwatch.png';

const Sidebar = ({ userName, timeLeft, questionsStatus, onQuestionSelect }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.timerCnt}>
        <div className={styles.timer}>
          <img src={clockIcon} alt="Clock Icon" className={styles.clockIcon} /> {timeLeft}
        </div>
      </div>
      <h3 className={styles.questionsTxt}>Questions</h3>
      <div className={styles.legend}>
        <div className={`${styles.legendItem} ${styles.answered}`}>
          <span className={styles.legendColorBox}></span> Answered
        </div>
        <div className={`${styles.legendItem} ${styles.visited}`}>
          <span className={styles.legendColorBox}></span> Visited
        </div>
        <div className={`${styles.legendItem} ${styles.unanswered}`}>
          <span className={styles.legendColorBox}></span> Unanswered
        </div>
      </div>
      <div className={styles.questionsList}>
        {questionsStatus.map((status, index) => (
          <div
            key={index}
            className={`${styles.questionBox} ${
              status?.status === 'answered'
                ? styles.answered
                : status?.status === 'visited'
                ? styles.visited
                : styles.unanswered
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
