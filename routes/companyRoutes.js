const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');
const CompanyController = require('../controllers/CompanyController');

const router = express.Router();

router.get('/company', auth, CompanyController.getCompany);
router.post('/add', auth, admin, upload.single('logo'), CompanyController.addCompany);
router.get('/', auth, admin, CompanyController.getCompanies);
router.put('/:id', auth, admin, upload.single('logo'), CompanyController.updateCompany);
router.delete('/:id', auth, admin, CompanyController.deleteCompany);

module.exports = router;
