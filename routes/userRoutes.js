const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.put('/profile-picture', auth, upload.single('profilePicture'), UserController.updateProfilePicture);
router.put('/candidato', auth, upload.single('profilePicture'), UserController.updateCandidato);
router.post('/address', auth, UserController.updateAddress);
router.post('/additional-info', auth, UserController.updateAdditionalInfo);
router.post('/complete-setup', auth, UserController.completeSetup);
router.post('/check-availability', UserController.checkAvailability);
router.get('/candidato', auth, UserController.getCandidato);
router.post('/change-email', auth, UserController.requestEmailChange);
router.post('/verify-email', auth, UserController.verifyEmailToken);
router.post('/resend-email-token', auth, UserController.resendEmailToken);

module.exports = router;
