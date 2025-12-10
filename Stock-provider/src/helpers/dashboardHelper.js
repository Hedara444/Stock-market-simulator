// src/helpers/dashboardHelper.js
const readline = require('readline');

// ANSI Color Codes
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const BRIGHT = "\x1b[1m";
const BG_GREEN = "\x1b[42m\x1b[30m"; // Black text on Green bg
const BG_RED = "\x1b[41m\x1b[37m";   // White text on Red bg

// Sparkline characters
const SPARKS = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

const renderDashboard = (stocksData, tickCount) => {
    // 1. Clear Screen
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);

    const now = new Date().toLocaleTimeString();

    // --- CONFIGURATION: Define Exact Column Widths ---
    const w = {
        ticker: 10,
        price: 16,
        change: 24,
        trend: 13,
        history: 32
    };

    // Helper to generate a line of specific length
    const line = (len) => '═'.repeat(len);

    // Dynamic Border Strings
    const topBorder = ` ╔${line(w.ticker)}╦${line(w.price)}╦${line(w.change)}╦${line(w.trend)}╦${line(w.history)}╗`;
    const separator = ` ╠${line(w.ticker)}╬${line(w.price)}╬${line(w.change)}╬${line(w.trend)}╬${line(w.history)}╣`;
    const botBorder = ` ╚${line(w.ticker)}╩${line(w.price)}╩${line(w.change)}╩${line(w.trend)}╩${line(w.history)}╝`;

    // 2. Header
    let output = `\n`;
    output += ` ${BRIGHT}${topBorder}${RESET}\n`;
    // We calculate the total inner width for the title line
    const totalWidth = w.ticker + w.price + w.change + w.trend + w.history + 4;
    const titleStr = `📈 MARKET MAKER TERMINAL (Server A)   Tick: #${tickCount}`.padEnd(totalWidth - 12) + `${now} `;

    output += ` ${BRIGHT}║${titleStr}║${RESET}\n`;
    output += ` ${BRIGHT}${separator}${RESET}\n`;

    // Column Headers (Using padEnd to ensure alignment)
    output += ` ${BRIGHT}║` +
        ` TICKER`.padEnd(w.ticker) + `║` +
        ` PRICE ($)`.padEnd(w.price) + `║` +
        ` CHANGE`.padEnd(w.change) + `║` +
        ` TREND`.padEnd(w.trend) + `║` +
        ` 15-TICK HISTORY`.padEnd(w.history) + `║${RESET}\n`;

    output += ` ${BRIGHT}${separator}${RESET}\n`;

    // 3. Render Each Stock Row
    stocksData.forEach(stock => {
        const { ticker, price, openPrice, history } = stock;

        // Logic
        const change = price - openPrice;
        const percent = ((change / openPrice) * 100).toFixed(2);
        const isUp = change >= 0;

        const color = isUp ? GREEN : RED;
        const sign = isUp ? '+' : '';

        // Formatting Content
        const tickStr = ` ${ticker}`; // Simple padding done at the end
        const priceStr = ` ${price.toFixed(2)}`;
        const changeStr = ` ${sign}${change.toFixed(2)} (${sign}${percent}%)`;

        // Visuals
        const barVisual = isUp
            ? `${BG_GREEN}  BULLISH  ${RESET}`
            : `${BG_RED}  BEARISH  ${RESET}`;

        const sparkline = generateSparkline(history);

        // --- ROW CONSTRUCTION (The Critical Part) ---
        // We construct the string *content* first, then PAD it to the column width.
        // Note: For 'barVisual' and 'color', we cannot use standard padding because ANSI codes mess up the length count.
        // We manually pad the strings *before* adding color codes where possible, or add spaces manually.

        // Ticker (Align Left)
        const c1 = tickStr.padEnd(w.ticker);

        // Price (Align Right for numbers usually, but here Left is fine)
        const c2 = (color + priceStr).padEnd(w.price + 10); // +10 for invisible ANSI chars length
        // actually, simpler to just pad the text then color it:
        const c2_clean = priceStr.padEnd(w.price);

        // Change
        const c3_clean = changeStr.padEnd(w.change);

        // Trend (Center manually)
        // Since barVisual has ANSI codes, we just place it.
        // "  BULLISH  " is 11 visible chars. Column is 13. We add 1 space padding.
        const c4 = ` ${barVisual} `;

        // History
        const c5 = ` ${sparkline}`.padEnd(w.history);

        output += ` ║${BRIGHT}${c1}${RESET}║${color}${c2_clean}${RESET}║${color}${c3_clean}${RESET}║${c4}║${c5}║\n`;
    });

    output += ` ${BRIGHT}${botBorder}${RESET}\n`;

    // 4. Print
    process.stdout.write(output);
};

// Helper to turn an array of numbers into [ ▂▃▅▆▇ ]
const generateSparkline = (history) => {
    if (!history || history.length === 0) return ''.repeat(29);

    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min;

    return history.map(val => {
        if (range === 0) return SPARKS[3]; // Flat line
        const step = (val - min) / range; // 0.0 to 1.0
        const index = Math.floor(step * (SPARKS.length - 1));
        return SPARKS[index];
    }).join(' ');
};

module.exports = { renderDashboard };