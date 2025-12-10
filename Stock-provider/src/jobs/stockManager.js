// src/jobs/stockManager.js
const stockRepo = require('../data-access/stockRepository');
const { calculateNextPrice } = require('../core/stockMath');

// In-Memory Storage for Dashboard Data
// Structure: { 'TSLA': { history: [150, 151, ...], lastOpen: 150 } }


// CHANGE 1: Import the new helper
const { renderChart } = require('../helpers/chartHelper');

// ... imports ...

let marketMemory = {};
let tickCounter = 0;

// CHANGE 2: Increase History Size
const MAX_HISTORY = 80; // Match chart width

const runJob = async () => {
    tickCounter++;

    try {
        const stocks = await stockRepo.getAllStocksWithControls();
        if (stocks.length === 0) return;

        const updates = stocks.map(stock => {
            if (!marketMemory[stock.ticker]) {
                marketMemory[stock.ticker] = {
                    // CHANGE 3: Larger buffer
                    history: new Array(MAX_HISTORY).fill(Number(stock.current_price)),
                    openPrice: Number(stock.current_price)
                };
            }

            const currentMem = marketMemory[stock.ticker];

            const newPrice = calculateNextPrice(Number(stock.current_price), {
                volatility: stock.volatility,
                good_news_chance: stock.good_news_chance,
                force_crash: stock.force_crash
            });

            currentMem.history.shift();
            currentMem.history.push(newPrice);

            return {
                id: stock.id,
                ticker: stock.ticker,
                price: newPrice,
                history: currentMem.history
            };
        });

        const dbUpdates = updates.map(u => ({ id: u.id, newPrice: u.price }));
        await stockRepo.bulkInsertStockValues(dbUpdates);

        // CHANGE 4: Call the Chart Renderer
        // Height: 15 rows, Width: 80 cols
        renderChart(updates, 15, MAX_HISTORY);

    } catch (error) {
        console.error("❌ [Job] Error:", error);
    }
};

const startStockManager = () => {
    setInterval(runJob, 5000);
    console.log("🚀 Market Maker Engine Started...");
};

module.exports = { startStockManager };