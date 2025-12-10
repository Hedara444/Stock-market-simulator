// src/helpers/chartHelper.js
const readline = require('readline');

// ANSI Colors
const RESET = "\x1b[0m";
const BRIGHT = "\x1b[1m";
const GRAY = "\x1b[90m";

// Stock Colors (Assign a specific color to each index for overlapping differentiation)
const COLORS = [
    "\x1b[32m", // Green
    "\x1b[36m", // Cyan
    "\x1b[33m", // Yellow
    "\x1b[35m", // Magenta
    "\x1b[31m", // Red
    "\x1b[34m", // Blue
];

/**
 * Renders a multi-line chart in the terminal.
 * @param {Array} stocksData - Array of stock objects with history
 * @param {number} height - Height of the chart in rows (default 15)
 * @param {number} width - Width of the chart in columns (default 60)
 */
const renderChart = (stocksData, height = 30, width = 80) => {
    // 1. Clear Screen
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);

    // 2. Determine Scale (Global Min/Max)
    let globalMin = Infinity;
    let globalMax = -Infinity;

    // We only care about the last 'width' data points to fit the screen
    stocksData.forEach(stock => {
        // Take strictly the last 'width' items
        const visibleHistory = stock.history.slice(-width);
        const stockMin = Math.min(...visibleHistory);
        const stockMax = Math.max(...visibleHistory);
        if (stockMin < globalMin) globalMin = stockMin;
        if (stockMax > globalMax) globalMax = stockMax;
    });

    // Add padding to min/max so lines don't touch the borders strictly
    const range = globalMax - globalMin;
    // Prevent division by zero if flat line
    const safeRange = range === 0 ? 1 : range;

    // 3. Initialize Blank Canvas (2D Grid)
    // Grid is [row][col]
    const grid = Array(height).fill(null).map(() => Array(width).fill(' '));

    // 4. Plot Points
    stocksData.forEach((stock, index) => {
        const color = COLORS[index % COLORS.length];
        // Use the first letter of ticker as the "point" marker
        const char = stock.ticker[0];

        // Get data that fits in the window
        const dataPoints = stock.history.slice(-width);

        dataPoints.forEach((price, xIndex) => {
            // Map Price to Row (0 is bottom, height-1 is top)
            // Normalized value 0.0 to 1.0
            const normalized = (price - globalMin) / safeRange;

            // Map to integer row index
            // We flip it because Array[0] is the top, but graph 0 is bottom
            const rowIndex = Math.floor(normalized * (height - 1));
            const invertedRow = (height - 1) - rowIndex;

            // Mark the grid
            // We use columns starting from the right if history is short, or left if full
            // Let's align to the right side of the screen
            const colIndex = width - (dataPoints.length - xIndex);

            if (grid[invertedRow] && grid[invertedRow][colIndex] !== undefined) {
                // If collision, we overwrite (or could show '+')
                grid[invertedRow][colIndex] = `${color}${char}${RESET}`;
            }
        });
    });

    // 5. Draw the Chart
    const header = `${BRIGHT}📈 LIVE MARKET CHART (Tick Based) - Range: $${globalMin.toFixed(2)} - $${globalMax.toFixed(2)}${RESET}`;
    process.stdout.write(`\n ${header}\n`);

    // Top Border
    process.stdout.write(` ┌${'─'.repeat(width)}┐\n`);

    // Rows
    for (let r = 0; r < height; r++) {
        const rowString = grid[r].join('');
        // Y-Axis label (Show price on left for top/bottom/middle)
        let label = '       '; // 7 spaces
        if (r === 0) label = `${globalMax.toFixed(2)}`.padEnd(7);
        else if (r === height - 1) label = `${globalMin.toFixed(2)}`.padEnd(7);
        else if (r === Math.floor(height / 2)) label = `${((globalMin + globalMax)/2).toFixed(2)}`.padEnd(7);

        process.stdout.write(` ${GRAY}${label}${RESET}│${rowString}│\n`);
    }

    // Bottom Border
    process.stdout.write(` └${'─'.repeat(width)}┘\n`);

    // 6. Draw Legend
    const legend = stocksData.map((s, i) => {
        const color = COLORS[i % COLORS.length];
        return `${color}■ ${s.ticker} ($${s.price.toFixed(2)})${RESET}`;
    }).join('   ');

    process.stdout.write(` ${legend}\n`);
};

module.exports = { renderChart };