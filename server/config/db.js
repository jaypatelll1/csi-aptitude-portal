const { Pool } = require('pg');
const {PGHOST, PGDATABASE, PGUSER, PGPASSWORD} = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { require: true}, 
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