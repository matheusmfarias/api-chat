const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const JobController = require('../controllers/jobController');

const router = express.Router();

router.get('/', auth, JobController.getJobs);
router.post('/', auth, JobController.addJob);
router.put('/:id', auth, JobController.updateJob);
router.delete('/:id', auth, JobController.deleteJob);
router.put('/toggle-status/:id', auth, JobController.toggleJobStatus);

// Nova rota para submeter currículo
router.post('/:id/submit-curriculum', auth, JobController.submitCurriculum);
router.get('/applications/:jobId', auth, JobController.getJobApplications);

// Rotas para vagas
router.get('/:companyId/jobs', auth, admin, JobController.getJobsByCompany);

// Rotas para candidatos
router.get('/:jobId/candidates', auth, admin, JobController.getCandidatesByJob);

module.exports = router;
