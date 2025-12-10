const express = require('express');
const cors = require('cors');
require('dotenv').config();

const stockRoutes = require('./routes/stockRoutes');

const app = express();
const PORT = process.env.PORT || 5000; // Running on 5000 to avoid conflict with Server A (4000)

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stocks', stockRoutes);

app.get('/', (req, res) => {
    res.send('Server B (User App - MVC + Patterns) is Running');
});

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`Server B listening on port ${PORT}`);
    console.log(`========================================\n`);
});