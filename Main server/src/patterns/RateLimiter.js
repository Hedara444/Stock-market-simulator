// src/patterns/RateLimiter.js (UPDATED)

class RateLimiter {
    constructor(capacity, refillRate , sidecar) {
        this.capacity = capacity;
        this.tokens = capacity;
        this.refillRate = refillRate;
        this.lastRefill = Date.now();
        this.refillInterval = null; // To hold the interval timer
        this.sidecar = sidecar; // <--- Store Sidecar instance
    }

    /**
     * Replaces the internal _refill with a public method
     */
    refill() {
        const now = Date.now();
        const elapsedSeconds = (now - this.lastRefill) / 1000;

        if (elapsedSeconds > 0) {
            const newTokens = elapsedSeconds * this.refillRate;
            this.tokens = Math.min(this.capacity, this.tokens + newTokens);
            this.lastRefill = now;
        }
    }

    /**
     * Starts the Active Refill background job
     */
    startRefillJob(intervalMs = 50) {
        // We refill very frequently (e.g., every 50ms) for high precision
        if (this.refillInterval) clearInterval(this.refillInterval);

        this.refillInterval = setInterval(() => {
            this.refill();
        }, intervalMs);

        console.log(`⏱️ [RateLimiter] Active refill job started (Rate: ${this.refillRate} token/sec)`);
    }

    allowRequest(cost = 1) {
        // *** IMPORTANT CHANGE: REMOVE THIS.REFILL() CALL ***
        // The tokens are now always up-to-date due to the background job.

        if (this.tokens >= cost) {
            this.tokens -= cost;
            return true;
        }
        // *** LOG THE BLOCK ***
        if (this.sidecar) {
            this.sidecar.logEvent(`⛔ BLOCKED: ${cost} token request.`);
        }
        return false;
    }

    getStats() {
        // No need to call this.refill() here anymore
        return {
            tokens: this.tokens.toFixed(2),
            capacity: this.capacity
        };
    }
}

module.exports = RateLimiter;