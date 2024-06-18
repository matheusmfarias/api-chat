const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

// Configuração do Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'profilePicture-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Endpoint para adicionar foto de perfil
router.post('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send('Usuário não encontrado');
        }

        // Atualiza a foto de perfil do usuário
        user.profilePicture = `/uploads/${req.file.filename}`;
        await user.save();

        res.send(user);
    } catch (error) {
        console.error('Erro ao atualizar a foto de perfil:', error);
        res.status(500).send('Erro ao atualizar a foto de perfil');
    }
});

// Endpoint para atualizar foto de perfil
router.put('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send('Usuário não encontrado');
        }

        // Remove a foto de perfil antiga, se houver
        if (user.profilePicture) {
            const oldPath = path.join(__dirname, '..', user.profilePicture);
            fs.unlink(oldPath, (err) => {
                if (err) {
                    console.error('Erro ao remover a foto de perfil antiga:', err);
                }
            });
        }

        // Atualiza a foto de perfil do usuário
        user.profilePicture = `/uploads/${req.file.filename}`;
        await user.save();

        res.send(user);
    } catch (error) {
        console.error('Erro ao atualizar a foto de perfil:', error);
        res.status(500).send('Erro ao atualizar a foto de perfil');
    }
});

// Atualizar endereço
router.post('/address', auth, async (req, res) => {
    try {
        const user = req.user;
        user.address = req.body;
        await user.save();
        res.status(200).send('Endereço atualizado com sucesso');
    } catch (error) {
        res.status(400).send('Erro ao atualizar endereço');
    }
});

// Atualizar informações adicionais
router.post('/additional-info', auth, async (req, res) => {
    try {
        const user = req.user;
        user.additionalInfo = req.body;
        await user.save();
        res.status(200).send('Informações adicionais atualizadas com sucesso');
    } catch (error) {
        res.status(400).send('Erro ao atualizar informações adicionais');
    }
});

// Atualizar status de profileCompleted do usuário
router.post('/complete-setup', auth, async (req, res) => {
    try {
        const user = req.user;
        user.profileCompleted = true;
        await user.save();
        res.status(200).send('Profile setup completed successfully.');
    } catch (error) {
        res.status(500).send('Error completing profile setup.');
    }
});

// Verificar se e-mail ou CPF já estão cadastrados
router.post('/check-availability', async (req, res) => {
    const { email, cpf } = req.body;

    try {
        const emailExists = await User.findOne({ email });
        const cpfExists = await User.findOne({ cpf });

        res.status(200).json({ emailExists: !!emailExists, cpfExists: !!cpfExists });
    } catch (error) {
        res.status(500).send('Erro ao verificar disponibilidade.');
    }
});

router.get('/candidato', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send('Usuário não encontrado');
        }

        res.send(user);
    } catch (error) {
        console.error('Erro ao buscar os dados do usuário', error);
        res.status(500).send('Erro ao buscar os dados do usuário');
    }
});


// Endpoint para atualizar os dados do usuário
router.put('/candidato', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('Usuário não encontrado');
        }

        // Atualiza campos individuais
        user.nome = req.body.firstName || user.nome;
        user.sobrenome = req.body.lastName || user.sobrenome;
        user.additionalInfo = {
            maritialStatus: req.body.maritalStatus || user.additionalInfo.maritialStatus,
            contactPhone: req.body.contactPhone || user.additionalInfo.contactPhone,
            backupPhone: req.body.backupPhone || user.additionalInfo.backupPhone
        };
        user.cpf = req.body.cpf || user.cpf;
        user.nascimento = req.body.birthDate || user.nascimento;
        user.email = req.body.email || user.email;
        user.address = {
            street: req.body.street || user.address.street,
            number: req.body.number || user.address.number,
            district: req.body.neighborhood || user.address.district,
            city: req.body.city || user.address.city
        };

        // Atualiza a foto de perfil se fornecida
        if (req.file) {
            if (user.profilePicture) {
                const oldPath = path.join(__dirname, '..', user.profilePicture);
                fs.unlink(oldPath, (err) => {
                    if (err) {
                        console.error('Erro ao remover a foto de perfil antiga:', err);
                    }
                });
            }
            user.profilePicture = `/uploads/${req.file.filename}`;
        }

        await user.save();

        res.send(user);
    } catch (error) {
        console.error('Erro ao atualizar os dados do usuário:', error);
        res.status(500).send('Erro ao atualizar os dados do usuário');
    }
});

module.exports = router;
