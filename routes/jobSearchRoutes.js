const express = require('express');
const auth = require('../middleware/auth');
const JobSearchController = require('../controllers/jobSearchController');

const router = express.Router();

// Rota para buscar todas as vagas (listagem)
router.get('/', auth, JobSearchController.getJobs);

// Rota para buscar os detalhes de uma vaga específica pelo ID
router.get('/:id', auth, JobSearchController.getJobById);

module.exports = router;
