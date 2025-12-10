// src/helpers/dbHelper.js
const { Pool } = require('pg');
require('dotenv').config();

// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT,
// });

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "stock_sim_db",
    password:"postgres",
    port: 5432,
});

console.log("DB_PASSWORD value being used:", process.env.DB_PASSWORD); // <-- ADD THIS LINE
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        // console.log('executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Error executing query', { text, error });
        throw error;
    }
};

module.exports = {
    query,
    pool
};