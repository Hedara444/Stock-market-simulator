// src/controllers/StockController.js (UPDATED: Order of instantiation is important)
const StockRepository = require('../models/StockRepository');
const RateLimiter = require('../patterns/RateLimiter');
const CircuitBreaker = require('../patterns/CircuitBreaker');
const CacheAside = require('../patterns/CacheAside');
const Sidecar = require('../patterns/Sidecar');

class StockController {
    constructor() {
        this.repo = new StockRepository();

        // --- 1. INSTANTIATE SIDECAR FIRST (The Observer) ---
        // Placeholder for the other components
        const patterns = {
            circuitBreaker: null,
            rateLimiter: null,
            cache: null
        };
        this.sidecar = new Sidecar(patterns);

        // --- 2. INSTANTIATE PATTERNS, INJECTING SIDECAR ---

        this.cache = new CacheAside(15);
        this.circuitBreaker = new CircuitBreaker(3, 3000);
        // Pass the sidecar instance to the RateLimiter
        this.rateLimiter = new RateLimiter(5, 0.5, this.sidecar);
        this.rateLimiter.startRefillJob();

        // --- 3. FINAL SETUP ---
        // Update the sidecar with the initialized components
        this.sidecar.components.cache = this.cache;
        this.sidecar.components.circuitBreaker = this.circuitBreaker;
        this.sidecar.components.rateLimiter = this.rateLimiter;

        this.sidecar.startMonitoring(2000); // Update every 1 second
    }

    async getStockPrice(req, res) {
        const stockId = req.params.id;

        // --- PATTERN 1: RATE LIMITER ---
        // RateLimiter will automatically log a BLOCKED event if it returns false.
        if (!this.rateLimiter.allowRequest()) {
            return res.status(429).json({ error: "Too Many Requests. Rate limit exceeded.", source: "rate_limiter" });
        }

        try {
            // --- PATTERN 2: CACHE-ASIDE ---
            const cachedData = this.cache.get(stockId);
            if (cachedData) {
                this.sidecar.logEvent(`⚡ CACHE HIT for Stock ${stockId}`); // <--- LOG HIT
                return res.json({ data: cachedData, source: 'cache' });
            }

            this.sidecar.logEvent(`❓ CACHE MISS for Stock ${stockId}`); // <--- LOG MISS

            // --- PATTERN 3: CIRCUIT BREAKER ---
            const data = await this.circuitBreaker.call(async () => {
                return await this.repo.fetchFromExternalAPI(stockId);
            });

            this.cache.set(stockId, data);
            this.sidecar.logEvent(`🌐 API SUCCESS for Stock ${stockId}`); // <--- LOG API SUCCESS

            return res.json({ data: data, source: 'live_api' });

        } catch (error) {
            // ... Fallback logic remains the same ...
            this.sidecar.logEvent(`❌ FAILURE: ${error.message.substring(0, 20)}...`); // Log the failure

            // Fallback logic...
            try {
                const fallbackData = await this.repo.fetchFromDB(stockId);
                this.sidecar.logEvent(`🛡️ FALLBACK SUCCESS for Stock ${stockId}`); // Log fallback success
                return res.json({
                    data: fallbackData,
                    source: 'fallback_db',
                    message: 'Live updates unavailable. Showing last known price.',
                    error: error.message
                });
            } catch (dbError) {
                this.sidecar.logEvent(`🔥 CRITICAL: DB Fallback failed for ${stockId}`);
                return res.status(503).json({ error: "Service Unavailable", details: "External API down and DB fallback failed." });
            }
        }
    }
}

module.exports = new StockController();