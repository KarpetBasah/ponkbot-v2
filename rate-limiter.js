// rate-limiter.js - Simple rate limiter for Derpibooru API
class RateLimiter {
    constructor() {
        this.requests = [];
        this.searchRequests = [];
        this.maxRequests = 30; // 30 requests per 5 seconds (general)
        this.maxSearchRequests = 20; // 20 search requests per 10 seconds
        this.timeWindow = 5000; // 5 seconds for general
        this.searchTimeWindow = 10000; // 10 seconds for search
    }

    async checkGeneralLimit() {
        const now = Date.now();
        // Remove requests older than the time window
        this.requests = this.requests.filter(timestamp => now - timestamp < this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = Math.min(...this.requests);
            const waitTime = this.timeWindow - (now - oldestRequest);
            throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
        }
        
        this.requests.push(now);
        return true;
    }

    async checkSearchLimit() {
        const now = Date.now();
        // Remove requests older than the search time window
        this.searchRequests = this.searchRequests.filter(timestamp => now - timestamp < this.searchTimeWindow);
        
        if (this.searchRequests.length >= this.maxSearchRequests) {
            const oldestRequest = Math.min(...this.searchRequests);
            const waitTime = this.searchTimeWindow - (now - oldestRequest);
            throw new Error(`Search rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
        }
        
        this.searchRequests.push(now);
        return true;
    }
}

// Export a singleton instance
module.exports = new RateLimiter();
