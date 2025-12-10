// src/patterns/CacheAside.js
class CacheAside {
    constructor(ttlSeconds = 10) {
        this.cache = new Map();
        this.ttl = ttlSeconds * 1000;
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }

    set(key, value) {
        this.cache.set(key, {
            value: value,
            expiry: Date.now() + this.ttl
        });
    }

    // For the Sidecar
    getStats() {
        return {
            items: this.cache.size
        };
    }
}

module.exports = CacheAside;