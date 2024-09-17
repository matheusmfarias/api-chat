const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const CompanyController = require('../controllers/CompanyController');

const router = express.Router();

router.get('/me', auth, CompanyController.getCurrentCompany);
router.post('/add', auth, admin, CompanyController.addCompany);
router.get('/', auth, admin, CompanyController.getCompanies);
router.put('/:id', auth, admin, CompanyController.updateCompany);
router.delete('/:id', auth, admin, CompanyController.deleteCompany);
router.put('/toggle-status/:id', auth, admin, CompanyController.toggleCompanyStatus);
router.get('/:companyId/jobs', auth, admin, CompanyController.getJobsByCompany);
router.get('/jobs/:jobId/candidates', auth, admin, CompanyController.getCandidatesByJob);



module.exports = router;
