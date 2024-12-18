const { Pool } = require('pg');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "class",
    password: "12345",
    port: 5432,
});

// / Function to run queries with async/await
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);  // Use 'await' here to properly handle the async query
    console.log('Success');
    return res;  // Return the result of the query
  } catch (error) {
    console.error('Error running query!', error.stack);
    throw error; // Rethrow the error to be handled by the caller
  } finally {
    client.release();  // Always release the client, even if there's an error
  }
}
  const testConnection = async () => {
    try {
      const client = await pool.connect();
      const res = await client.query('SELECT NOW()');  // Test query to check connection
      console.log('Connected to PostgreSQL:', res.rows[0].now);  // Print the current timestamp from the database
      client.release();
    } catch (err) {
      console.error('Error connecting to PostgreSQL:', err.stack);
    }
};

testConnection();

module.exports = { query };