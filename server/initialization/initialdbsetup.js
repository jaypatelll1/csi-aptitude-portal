const pool = require('../config/db');

// Initialize connection pool



const query = ` 
CREATE TYPE role_enum AS ENUM ('TPO','Student');
CREATE TYPE user_status AS ENUM ('NOTACTIVE', 'ACTIVE');
CREATE TYPE branch_enum AS ENUM ('CMPM', 'INFT', 'ECS', 'EXTC', 'EEE');
CREATE TYPE year_enum AS ENUM ('FE', 'SE', 'TE', 'BE');


CREATE TABLE IF NOT EXISTS public.users
(
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(50) UNIQUE,
    password_hash TEXT,
    role role_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status user_status DEFAULT 'NOTACTIVE',
    department branch_enum,
    year year_enum,
    rollno INTEGER,
    phone VARCHAR(15) NULL
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

CREATE TYPE exam_status AS ENUM ('draft', 'scheduled', 'past');

ALTER TABLE exams
  ADD COLUMN status exam_status DEFAULT 'draft';

` 
// Function to initialize the database schema
async function initializeDB() {
  try {
    const result = await pool.query(query);
    console.log(`Successfully Completed`);
  } catch (error) {
    console.log(error);
  } 
}
initializeDB();

// Export query method and initialization function
//module.exports = { pool, initializeDB };

