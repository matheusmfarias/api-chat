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
router.post('/verify-email', UserController.verifyEmailToken);
router.post('/resend-email-token', UserController.resendEmailToken);

// Rotas para experiências
router.post('/experiences', auth, UserController.addExperience);
router.put('/experiences/:expId', auth, UserController.updateExperience);
router.delete('/experiences/:expId', auth, UserController.deleteExperience);
router.get('/experiences', auth, UserController.getExperiences);
router.get('/experiences/:expId', auth, UserController.getExperienceById);

// Rotas para formações
router.post('/formacao', auth, UserController.addFormacao);
router.put('/formacao/:formacaoId', auth, UserController.updateFormacao);
router.delete('/formacao/:formacaoId', auth, UserController.deleteFormacao);
router.get('/formacao', auth, UserController.getFormacao);
router.get('/formacao/:formacaoId', auth, UserController.getFormacaoById);

module.exports = router;
