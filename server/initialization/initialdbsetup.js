const pool = require('../config/db');

// Initialize connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Ensure SSL for Neon.tech
});

// Function to initialize the database schema
async function initializeDB() {
  try {
    const result = await pool.query(`
      CREATE TYPE role_enum AS ENUM ('TPO', 'Student');

      CREATE TABLE users (
        user_id integer NOT NULL,
        name character varying(50) COLLATE pg_catalog."default",
        email character varying(50) COLLATE pg_catalog."default",
        password_hash text COLLATE pg_catalog."default",
        role role_enum NOT NULL,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT users_pkey PRIMARY KEY (user_id),
        CONSTRAINT users_email_key UNIQUE (email)
      );

      CREATE TABLE exams (
        exam_id integer NOT NULL,
        exam_name character varying(30) COLLATE pg_catalog."default",
        created_by integer,
        duration integer,
        start_time timestamp without time zone,
        end_time timestamp without time zone,
        created_at timestamp without time zone,
        CONSTRAINT exams_pkey PRIMARY KEY (exam_id),
        CONSTRAINT exams_created_by_fkey FOREIGN KEY (created_by)
            REFERENCES public.users (user_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
      );

      CREATE TABLE questions (
        question_id integer NOT NULL,
        exam_id integer,
        question_text text COLLATE pg_catalog."default",
        options jsonb,
        correct_option character(1) COLLATE pg_catalog."default",
        CONSTRAINT questions_pkey PRIMARY KEY (question_id),
        CONSTRAINT exam_id UNIQUE (exam_id),
        CONSTRAINT questions_exam_id_fkey FOREIGN KEY (exam_id)
            REFERENCES public.exams (exam_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
      );
          
      CREATE TABLE responses (
        response_id integer NOT NULL,
        student_id integer,
        exam_id integer,
        question_id integer,
        selected_option character(1) COLLATE pg_catalog."default",
        answered_at timestamp without time zone,
        CONSTRAINT responses_pkey PRIMARY KEY (response_id),
        CONSTRAINT responses_exam_id_key UNIQUE (exam_id),
        CONSTRAINT responses_question_id_key UNIQUE (question_id),
        CONSTRAINT responses_student_id_key UNIQUE (student_id),
        CONSTRAINT responses_exam_id_fkey FOREIGN KEY (exam_id)
            REFERENCES public.exams (exam_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION,
        CONSTRAINT responses_student_id_fkey FOREIGN KEY (student_id)
            REFERENCES public.users (user_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
      );

      CREATE TABLE results (
        result_id integer NOT NULL,
        student_id integer,
        exam_id integer,
        total_score integer,
        max_score integer,
        completed_at timestamp without time zone,
        CONSTRAINT results_pkey PRIMARY KEY (result_id),
        CONSTRAINT results_exam_id_fkey FOREIGN KEY (exam_id)
            REFERENCES public.exams (exam_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION,
        CONSTRAINT results_student_id_fkey FOREIGN KEY (student_id)
            REFERENCES public.users (user_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
      );  

      CREATE TABLE logs (
        logs_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
        activity VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50), -- e.g., "success" or "failure"
        details TEXT -- Optional: Additional information about the activity
      );
    `);
    console.log(`Successfully Completed`);
  } catch (error) {
    console.log(error);
  } finally {
    client.release();
  }
}
initializeDB();

// Export query method and initialization function
module.exports = { pool, initializeDB };
