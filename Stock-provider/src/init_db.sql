-- Run this in your SQL Query Tool

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stocks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ticker VARCHAR(10) UNIQUE NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE, -- For the "Toggle Off" feature
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_controls (
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    volatility DECIMAL(5, 2) DEFAULT 0.02, -- 2% fluctuation
good_news_chance DECIMAL(3, 2) DEFAULT 0.5, -- 50% chance of going up
force_crash BOOLEAN DEFAULT FALSE, -- Admin "Kill Switch"
PRIMARY KEY (stock_id)
);

CREATE TABLE IF NOT EXISTS stock_values (
    id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);