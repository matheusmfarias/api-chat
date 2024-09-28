const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const app = require('./app');

connectDB();

// Middleware para servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});