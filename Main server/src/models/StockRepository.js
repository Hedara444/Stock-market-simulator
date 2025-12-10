// src/models/StockRepository.js
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

class StockRepository {
    constructor() {
        // Setup DB Connection for Fallback access
        this.pool = new Pool({
            user: "postgres",
            host: "localhost",
            database: "stock_sim_db", // the DB name
            password:"postgres", // the DB password
            port: 5432,
        });

        // URL of Server A (The Generator)
        this.apiBaseUrl = process.env.SERVER_A_URL || 'http://localhost:4000/api/admin';
    }

    /**
     * PRIMARY METHOD: Calls Server A API
     */
    async fetchFromExternalAPI(ticker) {
        // We assume Server A has an endpoint GET /stocks/:id
        // Since we are simulating, let's map ticker to ID or just search
        // For MVP, let's assume we call by ID or searching list.
        // Let's assume Server A exposes: GET /api/admin/stocks/:id

        // NOTE: In a real app, you'd look up ID by ticker first.
        // For simplicity here, we assume the input IS the ID.
        const response = await axios.get(`${this.apiBaseUrl}/stocks/${ticker}`);
        return response.data;
    }

    /**
     * FALLBACK METHOD: Reads from Shared DB
     */
    async fetchFromDB(ticker) {
        console.log(`[Repository] 🛡️ Fallback: Reading DB directly for ${ticker}...`);

        const sql = `
            SELECT s.ticker, s.name, sv.price 
            FROM stocks s
            JOIN stock_values sv ON s.id = sv.stock_id
            WHERE s.id = $1
            ORDER BY sv.created_at DESC
            LIMIT 1
        `;

        const result = await this.pool.query(sql, [ticker]); // 'ticker' here acts as ID
        if (result.rows.length > 0) {
            return {
                ...result.rows[0],
                current_price: result.rows[0].price,
                source: "database_fallback"
            };
        }
        throw new Error("Stock not found in DB fallback");
    }
}

module.exports = StockRepository;