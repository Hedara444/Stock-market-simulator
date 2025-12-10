// src/patterns/Sidecar.js
const readline = require('readline');

class Sidecar {
    constructor(components) {
        this.components = components;
        this.intervalId = null;
        this.eventLog = [];
        this.maxLogLines = 10; // Limit the history displayed
    }

    startMonitoring(intervalMs = 1000) {
        // Run more frequently (e.g., every 1 second) for a smoother update
        console.log("👀 [Sidecar] Monitoring initialized. Waiting for data...");
        this.intervalId = setInterval(() => {
            this._refreshDisplay();
        }, intervalMs);
    }

    // Public method for other components (like RateLimiter) to call
    logEvent(event) {
        const timestamp = new Date().toLocaleTimeString();
        this.eventLog.unshift(`[${timestamp}] ${event}`);
        // Keep the log size manageable
        if (this.eventLog.length > this.maxLogLines) {
            this.eventLog.pop();
        }
    }

    // --- Terminal Control and Display Logic ---

    _refreshDisplay() {
        // Clear the previous output lines
        readline.cursorTo(process.stdout, 0, 0);
        readline.clearScreenDown(process.stdout);

        const stats = {
            circuitBreaker: this.components.circuitBreaker.getStats(),
            rateLimiter: this.components.rateLimiter.getStats(),
            cache: this.components.cache.getStats(),
            memoryUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
        };

        const output = this._formatDisplay(stats);
        process.stdout.write(output);
    }

    _formatDisplay(s) {
        let output = "";
        const now = new Date().toLocaleTimeString();

        // --- BOX 1: SYSTEM STATUS (The Heartbeat) ---
        output += `\n ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        output += ` 🚀 STOCK SIMULATION OBSERVER (Sidecar) - ${now}\n`;
        output += ` ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        // --- BOX 2: RESILIENCE & PERFORMANCE (Circuit & Cache) ---
        output += ` ┏━━━━━━━━━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        output += ` ┃ CIRCUIT BREAKER    ┃ ┃ CACHE-ASIDE          ┃\n`;
        output += ` ┣━━━━━━━━━━━━━━━━━━━━┛ ┣━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`;
        output += ` ┃ Status: ${s.circuitBreaker.state.padEnd(8)}┃ ┃ Items: ${String(s.cache.items).padEnd(9)} ┃\n`;
        output += ` ┃ Failures: ${String(s.circuitBreaker.failures).padEnd(6)}┃ ┃ Memory: ${s.memoryUsage} MB ┃\n`;
        output += ` ┗━━━━━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;

        // --- BOX 3: RATE LIMITER (The Gatekeeper) ---
        output += ` ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        output += ` ┃ RATE LIMITER (TOKEN BUCKET)                     ┃\n`;
        output += ` ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n`;
        output += ` ┃ Tokens: ${s.rateLimiter.tokens} / ${s.rateLimiter.capacity} | Refill Rate: ${this.components.rateLimiter.refillRate} token/sec ┃\n`;
        output += ` ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;

        // --- BOX 4: EVENT LOG (Logs the Cache Hits and Blocks) ---
        output += ` ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        output += ` ┃ SIDE CAR EVENT LOG (Activity Feed)              ┃\n`;
        output += ` ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n`;

        if (this.eventLog.length === 0) {
            output += ` ┃ Waiting for events...                      ┃\n`;
        } else {
            this.eventLog.forEach(logLine => {
                // Truncate logs to fit the box width
                const displayLine = logLine.substring(0, 33).padEnd(37, ' ');
                output += ` ┃ ${displayLine} ┃\n`;
            });
        }
        output += ` ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`;

        return output;
    }
}

module.exports = Sidecar;