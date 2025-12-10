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
            WHERE s.is_active = TRUE
        `;
        const result = await db.query(sql);
        return result.rows;
    }

    async bulkInsertStockValues(stockDataList) {
        if (stockDataList.length === 0) return;

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const values = [];
            const valuePlaceholders = stockDataList
                .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
                .join(', ');

            stockDataList.forEach(stock => {
                values.push(stock.id, stock.newPrice);
            });

            const historyQuery = `INSERT INTO stock_values (stock_id, price) VALUES ${valuePlaceholders}`;
            await client.query(historyQuery, values);

            for (const stock of stockDataList) {
                await client.query('UPDATE stocks SET current_price = $1 WHERE id = $2', [stock.newPrice, stock.id]);
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async createStock(ticker, name, initialPrice, controls) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const stockSql = `
                INSERT INTO stocks (ticker, name, current_price) 
                VALUES ($1, $2, $3) 
                RETURNING id, ticker, name, current_price`;
            const stockResult = await client.query(stockSql, [ticker, name, initialPrice]);
            const stock = stockResult.rows[0];

            const controlsSql = `
                INSERT INTO stock_controls (stock_id, volatility, good_news_chance)
                VALUES ($1, $2, $3)`;
            await client.query(controlsSql, [
                stock.id,
                controls.volatility,
                controls.good_news_chance
            ]);

            await client.query('COMMIT');
            return stock;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
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
            WHERE s.id = $1
        `;
        const result = await db.query(sql, [id]);
        return result.rows[0];
    }

    async updateStockControls(id, controls) {
        const sql = `
            UPDATE stock_controls 
            SET volatility = $1, good_news_chance = $2, force_crash = $3
            WHERE stock_id = $4
            RETURNING *`;
        const result = await db.query(sql, [
            controls.volatility,
            controls.good_news_chance,
            controls.force_crash,
            id
        ]);
        return result.rows[0];
    }

    async toggleStockActiveStatus(id, isActive) {
        const sql = `
            UPDATE stocks 
            SET is_active = $1
            WHERE id = $2
            RETURNING id, ticker, is_active`;
        const result = await db.query(sql, [isActive, id]);
        return result.rows[0];
    }
}

module.exports = new StockRepository();