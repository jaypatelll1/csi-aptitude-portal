require('dotenv').config();
const { Pool } = require('pg');

// Initialize connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Ensure SSL for Neon.tech
});

// Function to initialize the database schema
const initializeDB = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('Database initialized: "users" table is ready.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Export query method and initialization function
module.exports = { pool, initializeDB };