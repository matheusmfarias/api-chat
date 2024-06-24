const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cors = require('cors');
const app = express();

app.use(cors());

app.use(express.json({ extended: false }));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;