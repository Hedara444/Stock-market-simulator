const express = require('express');
const router = express.Router();
const stockController = require('../controllers/StockController');

// Note: We bind 'stockController' to preserve 'this' context for class methods
router.get('/:id', (req, res) => stockController.getStockPrice(req, res));

module.exports = router;