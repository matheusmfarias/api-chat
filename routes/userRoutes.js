const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.post('/profile-picture', auth, upload.single('profilePicture'), UserController.updateProfilePicture);
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

// Rota para buscar todas as informações de um usuário
router.get('/informacoes', auth, UserController.getInformacoes);

// Rotas para cursos
router.post('/cursos', auth, UserController.addCurso);
router.delete('/cursos', auth, UserController.removeCurso);

// Rotas para habilidades profissionais
router.post('/habilidadesProfissionais', auth, UserController.addHabilidadeProfissional);
router.delete('/habilidadesProfissionais', auth, UserController.removeHabilidadeProfissional);

// Rotas para habilidades comportamentais
router.post('/habilidadesComportamentais', auth, UserController.addHabilidadeComportamental);
router.delete('/habilidadesComportamentais', auth, UserController.removeHabilidadeComportamental);

// Rotas para objetivos
router.post('/objetivos', auth, UserController.addObjetivo);
router.delete('/objetivos', auth, UserController.removeObjetivo);

router.get('/candidatos', auth, UserController.getCandidatos);
router.get('/candidato/:candidatoId', auth, UserController.getCandidatoById);

router.get('/applications', auth, UserController.getUserApplications);

module.exports = router;
