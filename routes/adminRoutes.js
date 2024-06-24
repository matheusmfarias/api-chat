const express = require('express');
const AdminController = require('../controllers/AdminController');

const router = express.Router();

router.post('/create-admin', AdminController.createAdmin);

module.exports = router;
