// src/controllers/adminController.js
const adminService = require('../business-layer/adminService');

class AdminController {
    constructor(service) {
        this.adminService = service;
    }

    // Using arrow functions to preserve 'this' when used as route handlers
    login = async (req, res) => {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: "Username is required for login/registration." });
        }
        try {
            const admin = await this.adminService.loginAdmin(username);
            res.status(200).json(admin);
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Failed to process login." });
        }
    };

    createStock = async (req, res) => {
        const { ticker, name, initialPrice, controls } = req.body;
        if (!ticker || !name || !initialPrice) {
            return res.status(400).json({ error: "Missing required stock details: ticker, name, and initialPrice." });
        }
        try {
            const newStock = await this.adminService.addStock(ticker, name, initialPrice, controls || {});
            res.status(201).json(newStock);
        } catch (error) {
            console.error("Create stock error:", error);
            const status = error.code === '23505' ? 409 : 500;
            res.status(status).json({ error: "Failed to create stock. Check if ticker is unique.", detail: error.message });
        }
    };

    listStocks = async (req, res) => {
        try {
            const stocks = await this.adminService.listStocks();
            res.status(200).json({ "data": stocks });
        } catch (error) {
            console.error("List stocks error:", error);
            res.status(500).json({ error: "Failed to retrieve stock list." });
        }
    };

    getStockDetails = async (req, res) => {
        const { id } = req.params;
        try {
            const stock = await this.adminService.getStockDetails(id);
            if (!stock) {
                return res.status(404).json({ error: "Stock not found." });
            }
            res.status(200).json({ "data": stock });
        } catch (error) {
            console.error("Get stock details error:", error);
            res.status(500).json({ error: "Failed to retrieve stock details." });
        }
    };

    updateStockControls = async (req, res) => {
        const { id } = req.params;
        const updatePayload = req.body;

        if (Object.keys(updatePayload).length === 0) {
            return res.status(400).json({ error: "No update parameters provided." });
        }

        try {
            const updatedStock = await this.adminService.updateControls(id, updatePayload);
            res.status(200).json({ "data": updatedStock });
        } catch (error) {
            console.error("Update stock controls error:", error);
            res.status(404).json({ error: error.message || "Stock not found or update failed." });
        }
    };

    toggleStockActiveStatus = async (req, res) => {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive === 'undefined') {
            return res.status(400).json({ error: "Must provide 'isActive' boolean value (true/false)." });
        }

        try {
            const updatedStock = await this.adminService.toggleStock(id, isActive);
            const status = updatedStock.is_active ? 'running' : 'stopped';
            res.status(200).json({
                message: `Stock ${updatedStock.ticker} successfully set to ${status}.`,
                data: updatedStock
            });
        } catch (error) {
            console.error("Toggle stock status error:", error);
            res.status(500).json({ error: "Failed to update stock status." });
        }
    };

    getStockHistory = async (req, res) => {
        const { id } = req.params;
        const { filter } = req.query;
        try {
            const history = await this.adminService.getStockHistory(id, filter);
            res.status(200).json({ "data": history });
        } catch (error) {
            console.error("Get stock history error:", error);
            res.status(500).json({ error: "Failed to retrieve stock history." });
        }
    };
}

module.exports = new AdminController(adminService);