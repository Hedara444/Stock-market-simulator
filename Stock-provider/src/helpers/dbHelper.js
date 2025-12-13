// src/helpers/dbHelper.js
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
require('dotenv').config();

const dbFile = process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../../../data/stock_sim_db.sqlite');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const dbPromise = open({
    filename: dbFile,
    driver: sqlite3.Database
});


const query = async (text, params = []) => {
    const db = await dbPromise;
    const isSelect = /^\s*select/i.test(text);
    if (isSelect) {
        const rows = await db.all(text, params);
        return { rows, rowCount: rows.length };
    } else {
        const result = await db.run(text, params);
        return { rows: [], rowCount: result.changes || 0 };
    }
};

module.exports = {
    query,
    db: dbPromise,
    pool: null
};