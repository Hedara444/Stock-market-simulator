// src/patterns/CircuitBreaker.js
const axios = require('axios');

class CircuitBreaker {
    constructor(failureThreshold = 3, recoveryTimeout = 5000) {
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF-OPEN
        this.failureCount = 0;
        this.failureThreshold = failureThreshold;
        this.recoveryTimeout = recoveryTimeout;
        this.lastFailureTime = null;
    }

    async call(requestFn) {
        this._checkState();

        if (this.state === 'OPEN') {
            throw new Error('CIRCUIT_OPEN: Request blocked.');
        }

        try {
            const response = await requestFn();
            this._onSuccess();
            return response;
        } catch (error) {
            this._onFailure();
            throw error;
        }
    }

    _checkState() {
        if (this.state === 'OPEN') {
            const now = Date.now();
            if (now - this.lastFailureTime > this.recoveryTimeout) {
                console.log('⚡ [CircuitBreaker] Switching to HALF-OPEN');
                this.state = 'HALF-OPEN';
            }
        }
    }

    _onSuccess() {
        if (this.state === 'HALF-OPEN') {
            console.log('✅ [CircuitBreaker] Recovery successful. Switching to CLOSED');
            this.state = 'CLOSED';
            this.failureCount = 0;
        }
    }

    _onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        console.log(`⚠️ [CircuitBreaker] Failure detected (${this.failureCount}/${this.failureThreshold})`);

        if (this.failureCount >= this.failureThreshold) {
            console.log('🔥 [CircuitBreaker] Threshold reached. Switching to OPEN');
            this.state = 'OPEN';
        }
    }

    // For the Sidecar
    getStats() {
        return {
            state: this.state,
            failures: this.failureCount
        };
    }
}

module.exports = CircuitBreaker;