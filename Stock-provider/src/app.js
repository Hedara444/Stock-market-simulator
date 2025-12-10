// src/app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { startStockManager } = require('./jobs/stockManager');
const adminRoutes = require('./routes/adminRoutes'); // <--- ADD THIS

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use('/api/admin', adminRoutes); // <--- ADD THIS MOUNT POINT

// Routes (We will add these in the next step)
// const stockRoutes = require('./routes/stockRoutes');
// app.use('/api/stocks', stockRoutes);

app.get('/', (req, res) => {
    res.send('Server A (Admin/Generator) is Running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`Server A listening on port ${PORT}`);
    console.log(`========================================\n`);

    // START THE BACKGROUND JOB
     startStockManager();
});