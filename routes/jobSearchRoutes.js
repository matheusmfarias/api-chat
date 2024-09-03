const express = require('express');
const auth = require('../middleware/auth');
const JobSearchController = require('../controllers/JobSearchController');

const router = express.Router();

router.get('/', auth, JobSearchController.getJobs);

module.exports = router;