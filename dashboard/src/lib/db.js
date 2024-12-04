// lib/db.js
// const { Pool } = require('pg');
import { Pool } from 'pg';
const pool = new Pool({
  user: `${process.env.DATABASE_USERNAME}`,
  host: `${process.env.DATABASE_HOST}`,
  database: `${process.env.DATABASE_NAME}`,
  password: process.env.DATABASE_PASSWORD,
  port: `${process.env.DATABASE_PORT}`,
});

// export default query = (text, params) => pool.query(text, params);
// module.exports = {
//   query: (text, params) => pool.query(text, params),
// };

export const query = async (text, params) => {
  const result = await pool.query(text, params)
  // console.log(result)
  return result
};
