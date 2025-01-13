const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const AdminController = require('../controllers/adminController');

const router = express.Router();

router.post('/create-admin', AdminController.createAdmin);
router.get('/admin', auth, AdminController.getAdmin);
router.post('/change-email', auth, AdminController.changeEmail);
router.post('/change-password', auth, AdminController.changePassword);

module.exports = router;
