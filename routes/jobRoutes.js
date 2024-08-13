const express = require('express');
const auth = require('../middleware/auth');
const JobController = require('../controllers/JobController');

const router = express.Router();

router.get('/', auth, JobController.getJobs);
router.post('/', auth, JobController.addJob);
router.put('/:id', auth, JobController.updateJob);
router.delete('/:id', auth, JobController.deleteJob);
router.put('/toggle-status/:id', auth, JobController.toggleJobStatus);

module.exports = router;
