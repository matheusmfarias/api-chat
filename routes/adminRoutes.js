const express = require('express');
const AdminController = require('../controllers/adminController');

const router = express.Router();

router.post('/create-admin', AdminController.createAdmin);

module.exports = router;
