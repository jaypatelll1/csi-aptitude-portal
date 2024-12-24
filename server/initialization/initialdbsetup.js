const pool = require('../config/db2');

// Initialize connection pool



const query = `CREATE TYPE role_enum AS ENUM ('TPO', 'Student');

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(50) UNIQUE,
    password_hash TEXT,
    role role_enum NOT NULL
);

CREATE TABLE exams (
    exam_id SERIAL PRIMARY KEY,
    exam_name VARCHAR(30),
    created_by INTEGER,
    duration INTEGER,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (user_id)
);

CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    exam_id INTEGER,
    question_text TEXT,
    options JSONB,
    correct_option CHAR(1),
    FOREIGN KEY (exam_id) REFERENCES exams (exam_id)
);

CREATE TABLE responses (
    response_id SERIAL PRIMARY KEY,
    student_id INTEGER,
    exam_id INTEGER,
    question_id INTEGER,
    selected_option CHAR(1),
    answered_at TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams (exam_id),
    FOREIGN KEY (student_id) REFERENCES users (user_id)
);

CREATE TABLE results (
    result_id SERIAL PRIMARY KEY,
    student_id INTEGER,
    exam_id INTEGER,
    total_score INTEGER,
    max_score INTEGER,
    completed_at TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams (exam_id),
    FOREIGN KEY (student_id) REFERENCES users (user_id)
);
` 
// Function to initialize the database schema
async function initializeDB() {
  try {
    const result = await pool.query(query);
    console.log(`Successfully Completed`);
  } catch(error){
    console.log(error);
  } 
}
initializeDB();

// Export query method and initialization function
// module.exports = { pool, initializeDB };
