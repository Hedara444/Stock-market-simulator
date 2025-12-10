// src/business-layer/adminService.js
const adminRepoInstance = require('../data-access/adminRepository');
const stockRepoInstance = require('../data-access/stockRepository');
const db = require('../helpers/dbHelper');

class AdminService {
    constructor(adminRepo, stockRepo) {
        this.adminRepo = adminRepo;
        this.stockRepo = stockRepo;
    }

    async loginAdmin(username) {
        let admin = await this.adminRepo.findAdminByUsername(username);

        if (!admin) {
            admin = await this.adminRepo.createAdmin(username);
        }

        return {
            id: admin.id,
            username: admin.username,
            token: `mock-admin-token-${admin.id}`
        };
    }

    async addStock(ticker, name, initialPrice, controls) {
        if (!ticker || !name || !initialPrice) {
            throw new Error("Missing required stock details.");
        }

        const finalControls = {
            volatility: controls.volatility || 0.02,
            good_news_chance: controls.good_news_chance || 0.5,
        };

        return await this.stockRepo.createStock(ticker, name, initialPrice, finalControls);
    }

    async listStocks() {
        return this.stockRepo.getStocksList();
    }

    async getStockDetails(id) {
        return this.stockRepo.getStockById(id);
    }

    async updateControls(id, updatePayload) {
        const existingStock = await this.stockRepo.getStockById(id);
        if (!existingStock) throw new Error("Stock not found.");

        const finalControls = {
            volatility: updatePayload.volatility !== undefined ? updatePayload.volatility : existingStock.volatility,
            good_news_chance: updatePayload.good_news_chance !== undefined ? updatePayload.good_news_chance : existingStock.good_news_chance,
            force_crash: updatePayload.force_crash !== undefined ? updatePayload.force_crash : existingStock.force_crash
        };

        await this.stockRepo.updateStockControls(id, finalControls);
        return this.stockRepo.getStockById(id);
    }

    async toggleStock(id, isActive) {
        if (typeof isActive !== 'boolean') throw new Error("Invalid active status.");
        return this.stockRepo.toggleStockActiveStatus(id, isActive);
    }

    async getStockHistory(id, filter) {
        const sql = `
            SELECT price, created_at 
            FROM stock_values 
            WHERE stock_id = $1
            ORDER BY created_at DESC
            LIMIT 100`;
        const result = await db.query(sql, [id]);
        return {
            stock_id: id,
            filter: filter,
            history: result.rows
        };
    }
}

module.exports = new AdminService(adminRepoInstance, stockRepoInstance);