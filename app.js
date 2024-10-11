const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobSearchRoutes = require('./routes/jobSearchRoutes');
const auth = require('./middleware/auth');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ extended: false }));

// Servir a pasta de uploads de forma pública antes das outras rotas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/company', auth, companyRoutes);
app.use('/api/admin', auth, adminRoutes);
app.use('/api/jobs', auth, jobRoutes);
app.use('/api/jobsSearch', auth, jobSearchRoutes);

/*
// Serve os arquivos estáticos do build do React
app.use(express.static(path.join(__dirname, 'build')));

// Adicione esta rota para redirecionar todas as requisições para o index.html do React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
*/

module.exports = app;
