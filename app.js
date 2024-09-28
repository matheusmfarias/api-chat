const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobSearchRoutes = require('./routes/jobSearchRoutes');
const cors = require('cors');
const app = express();

const path = require('path');

app.use(cors());
app.use(express.json({ extended: false }));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobsSearch', jobSearchRoutes);

// Serve os arquivos estáticos do build do React
app.use(express.static(path.join(__dirname, 'build')));

// Adicione esta rota para redirecionar todas as requisições para o index.html do React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

module.exports = app;