const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

if (!process.env.PGDATABASE || !process.env.PGUSER || !process.env.PGPASSWORD || !process.env.PGPORT || !process.env.PGHOST) {
  console.error("Please set the environment variables PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD");
  process.exit(1);
}



const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER, // fixed key
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: true,
   max: 50,                  // limit clients in pool
      idleTimeoutMillis: 30000, // disconnect idle clients
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(1);
});

const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params); // await was missing
    return res;
  } catch (error) {
    console.error("Error running query!", error.stack);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { query };
