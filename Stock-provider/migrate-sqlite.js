const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {
  const dbFile = process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../data/stock_sim_db.sqlite');
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  const db = await open({ filename: dbFile, driver: sqlite3.Database });

  await db.exec('PRAGMA foreign_keys = ON');

  const ddl = `
    BEGIN;

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      ticker TEXT UNIQUE NOT NULL,
      current_price REAL NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_controls (
      stock_id INTEGER NOT NULL,
      volatility REAL DEFAULT 0.02,
      good_news_chance REAL DEFAULT 0.5,
      force_crash INTEGER DEFAULT 0,
      PRIMARY KEY (stock_id),
      FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS stock_values (
      id INTEGER PRIMARY KEY,
      stock_id INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_stock_values_stock_id_created_at
    ON stock_values (stock_id, created_at);

    COMMIT;
  `;

  await db.exec(ddl);
  await db.close();
  console.log('SQLite schema migrated at:', dbFile);
})();