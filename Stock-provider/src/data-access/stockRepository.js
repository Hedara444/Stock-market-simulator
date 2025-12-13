// src/data-access/stockRepository.js
const db = require('../helpers/dbHelper');
const IStockRepository = require('../interfaces/IStockRepository');

class StockRepository extends IStockRepository {
    async getAllStocksWithControls() {
        const sql = `
            SELECT s.id, s.ticker, s.current_price, s.is_active,
                   sc.volatility, sc.good_news_chance, sc.force_crash
            FROM stocks s
            JOIN stock_controls sc ON s.id = sc.stock_id
            WHERE s.is_active = 1
        `;
        const result = await db.query(sql);
        return result.rows;
    }

    async bulkInsertStockValues(stockDataList) {
        if (stockDataList.length === 0) return;

        const conn = await db.db;
        try {
            await conn.exec('BEGIN');

            const insertStmt = await conn.prepare('INSERT INTO stock_values (stock_id, price) VALUES (?, ?)');
            for (const stock of stockDataList) {
                await insertStmt.run([stock.id, stock.newPrice]);
                await conn.run('UPDATE stocks SET current_price = ? WHERE id = ?', [stock.newPrice, stock.id]);
            }
            await insertStmt.finalize();

            await conn.exec('COMMIT');
        } catch (e) {
            await conn.exec('ROLLBACK');
            throw e;
        }
    }

    async createStock(ticker, name, initialPrice, controls) {
        const conn = await db.db;
        try {
            await conn.exec('BEGIN');

            const stockSql = `INSERT INTO stocks (ticker, name, current_price) VALUES (?, ?, ?)`;
            const res = await conn.run(stockSql, [ticker, name, initialPrice]);
            const stockId = res.lastID;
            const stock = { id: stockId, ticker, name, current_price: initialPrice };

            const controlsSql = `INSERT INTO stock_controls (stock_id, volatility, good_news_chance) VALUES (?, ?, ?)`;
            await conn.run(controlsSql, [
                stockId,
                controls.volatility,
                controls.good_news_chance
            ]);

            await conn.exec('COMMIT');
            return stock;
        } catch (e) {
            await conn.exec('ROLLBACK');
            throw e;
        }
    }

    async getStocksList() {
        const sql = `
            SELECT s.id, s.name, s.ticker, s.current_price, s.is_active,
                   sc.volatility, sc.good_news_chance, sc.force_crash
            FROM stocks s
            JOIN stock_controls sc ON s.id = sc.stock_id
            ORDER BY s.ticker
        `;
        const result = await db.query(sql);
        return result.rows;
    }

    async getStockById(id) {
        const sql = `
            SELECT s.id, s.name, s.ticker, s.current_price, s.is_active,
                   sc.volatility, sc.good_news_chance, sc.force_crash
            FROM stocks s
            JOIN stock_controls sc ON s.id = sc.stock_id
            WHERE s.id = ?
        `;
        const result = await db.query(sql, [id]);
        return result.rows[0];
    }

    async updateStockControls(id, controls) {
        const conn = await db.db;
        await conn.run(
            `UPDATE stock_controls 
             SET volatility = ?, good_news_chance = ?, force_crash = ?
             WHERE stock_id = ?`,
            [controls.volatility, controls.good_news_chance, controls.force_crash, id]
        );
        const row = await conn.get(`SELECT * FROM stock_controls WHERE stock_id = ?`, [id]);
        return row;
    }

    async toggleStockActiveStatus(id, isActive) {
        const conn = await db.db;
        const activeVal = isActive ? 1 : 0;
        await conn.run(`UPDATE stocks SET is_active = ? WHERE id = ?`, [activeVal, id]);
        const row = await conn.get(`SELECT id, ticker, is_active FROM stocks WHERE id = ?`, [id]);
        return row;
    }
}

module.exports = new StockRepository();