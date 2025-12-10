// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// --- Auth Routes ---
// [POST : login/register, payload: username]
router.post('/login', adminController.login);


// --- Stock Management Routes (God Mode) ---

// 1. POST: stocks/create - Create a new stock with initial controls
router.post('/stocks/create', adminController.createStock);

// 2. GET: stocks/list - Get all stocks and their current state/controls
router.get('/stocks/list', adminController.listStocks);

// 3. GET: stocks/:id - Get the last stock's price/details
router.get('/stocks/:id', adminController.getStockDetails);

// 4. GET: stocks/:id/history - Get price history (with optional interval-filter)
router.get('/stocks/:id/history', adminController.getStockHistory);

// 5. PUT: stocks/:id - Manipulate stock controls (volatility, good_news, force_crash)
router.put('/stocks/:id', adminController.updateStockControls);

// 6. PATCH: stocks/:id/toggle - Toggle stock on/off (mimic service stop)
router.patch('/stocks/:id/toggle', adminController.toggleStockActiveStatus);


module.exports = router;