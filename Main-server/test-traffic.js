// test-traffic.js
const axios = require('axios');

const URL = 'http://localhost:5000/api/stocks/1';
const TOTAL_REQUESTS = 100;

// We want to send these virtually effectively at the same time
async function runTest() {
    console.log(`🚀 Firing ${TOTAL_REQUESTS} requests immediately...`);

    const promises = [];

    for (let i = 1; i <= TOTAL_REQUESTS; i++) {
        promises.push(
            axios.get(URL)
                .then(res => {
                    // Success (200 OK)
                    const source = res.data.source;
                    const icon = source === 'cache' ? '⚡' : '🌐';
                    console.log(`[Req ${i}] ${icon} Success (${res.status}) - Source: ${source}`);
                })
                .catch(err => {
                    // Failure (429 or 500)
                    if (err.response) {
                        const status = err.response.status;
                        const icon = status === 429 ? '⛔' : '❌';
                        console.log(`[Req ${i}] ${icon} Blocked (${status}) - ${err.response.data.error}`);
                    } else {
                        console.log(`[Req ${i}] ❌ Error: ${err.message}`);
                    }
                })
        );
    }

    await Promise.all(promises);
    console.log("Done.");
}

runTest();