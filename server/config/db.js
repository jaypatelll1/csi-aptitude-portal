const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false, // Allow insecure certificates
    require: true
},
});

const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const res = client.query(text, params);
    return res;
  } catch (error) {
    console.error("Error running query!", error.stack);
  } finally{
    if(client){
      client.release();
    }
  }
};

module.exports = { query };