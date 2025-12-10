// src/core/stockMath.js

/**
 * Calculates the next price based on the previous price and controls.
 * @param {number} currentPrice - The last known price.
 * @param {object} controls - { volatility, good_news_chance, force_crash }
 * @returns {number} - The new price.
 */
const calculateNextPrice = (currentPrice, controls) => {
    // 1. Check for Admin Kill Switch

    if(controls.force_crash && controls.good_news_chance === 1.0)
    {
        // Rise price by 30-50% immediately

        return Math.max(0.01, currentPrice * (1 + (Math.random() * 0.8 + 0.2)));

    }

    if (controls.force_crash && controls.good_news_chance === 0.0) {
        // Drop price by 30-50% immediately
        return Math.max(0.01, currentPrice * (1 - (Math.random() * 0.2 + 0.3)));
    }



    // 2. Determine Direction (Up or Down)
    // Random 0 to 1. If < chance, we go UP.
    const isGoodNews = Math.random() < Number(controls.good_news_chance);

    // 3. Calculate Change Percentage
    // Volatility is the max swing (e.g., 0.02 = 2%)
    // change = volatility * random_factor
    const changePercent = Number(controls.volatility) * Math.random();

    let newPrice;
    if (isGoodNews) {
        newPrice = currentPrice * (1 + changePercent);
    } else {
        newPrice = currentPrice * (1 - changePercent);
    }

    // Ensure price never drops below 0.01
    return Math.max(0.01, parseFloat(newPrice.toFixed(2)));
};

module.exports = { calculateNextPrice };