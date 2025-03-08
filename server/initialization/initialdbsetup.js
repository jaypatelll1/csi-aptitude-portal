const pool = require('../config/db');

// Initialize connection pool

const query = ` 
CREATE TYPE role_enum AS ENUM ('TPO','Student', 'Teacher', 'Department');
CREATE TYPE user_status AS ENUM ('NOTACTIVE', 'ACTIVE');
CREATE TYPE branch_enum AS ENUM ('CMPM', 'INFT', 'ECS', 'EXTC', 'ELEC');
CREATE TYPE year_enum AS ENUM ('FE', 'SE', 'TE', 'BE');
CREATE TYPE exam_status AS ENUM ('draft', 'scheduled', 'live', 'past');
CREATE TYPE response_status AS ENUM ('draft', 'submitted');


CREATE TABLE users(
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
    created_by INTEGER REFERENCES users(user_id),
    duration INTEGER,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP without time zone DEFAULT CURRENT_TIMESTAMP,
    status exam_status DEFAULT 'draft',
    exam_for role_enum NOT NULL DEFAULT 'Student' -- Defines if exam is for students or teachers
);

CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams (exam_id),
    question_text TEXT,
    question_type question_type_enum NOT NULL DEFAULT 'single_choice',
    options JSONB, -- Store options in JSON (for single/multiple-choice)
    correct_option CHAR(1) NULL, -- For single-choice questions
    correct_options JSONB NULL, -- For multiple-choice questions
    image_url TEXT NULL -- For image-based questions
);

CREATE TABLE responses (
    response_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(user_id),
    exam_id INTEGER REFERENCES exams (exam_id),
    question_id INTEGER REFERENCES questions (question_id),
    selected_option CHAR(1) NULL, -- For single-choice
    selected_options JSONB NULL, -- For multiple-choice or text-based responses
    text_response TEXT NULL, -- For text-based answers
    answered_at TIMESTAMP,
    status response_status DEFAULT 'draft'
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

CREATE TABLE student_analysis (
    analysis_id SERIAL PRIMARY KEY,
    exam_id INT REFERENCES exams(exam_id) ON DELETE CASCADE,
    department_name branch_enum NOT NULL,
    student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    exam_name VARCHAR(255),
    category JSONB, 
    total_score FLOAT NOT NULL,
    max_score FLOAT NOT NULL,
    attempted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE student_rank (
    rank_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    department_name branch_enum NOT NULL,
    rank INT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_score INTEGER,
    student_name VARCHAR(255)
);
`;

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
