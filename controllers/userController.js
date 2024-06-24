const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { sendConfirmationEmail } = require('../services/emailService');
const { createToken } = require('../services/tokenService');

const updateProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        if (user.profilePicture) {
            const oldPath = path.join(__dirname, '..', user.profilePicture);
            fs.unlink(oldPath, err => {
                if (err) console.error('Erro ao remover a foto de perfil antiga:', err);
            });
        }

        user.profilePicture = `/uploads/${req.file.filename}`;
        await user.save();

        res.send(user);
    } catch (error) {
        console.error('Erro ao atualizar a foto de perfil:', error);
        res.status(500).send('Erro ao atualizar a foto de perfil');
    }
};

const updateCandidato = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        user.nome = req.body.firstName || user.nome;
        user.sobrenome = req.body.lastName || user.sobrenome;
        user.additionalInfo = {
            maritalStatus: req.body.maritalStatus || user.additionalInfo.maritalStatus,
            contactPhone: req.body.contactPhone || user.additionalInfo.contactPhone,
            backupPhone: req.body.backupPhone || user.additionalInfo.backupPhone,
            rg: req.body.rg || user.additionalInfo.rg,
            cnh: req.body.cnh || user.additionalInfo.cnh,
            cnhTypes: req.body.cnhTypes || user.additionalInfo.cnhTypes
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

        if (req.file) {
            if (user.profilePicture) {
                const oldPath = path.join(__dirname, '..', user.profilePicture);
                fs.unlink(oldPath, err => {
                    if (err) console.error('Erro ao remover a foto de perfil antiga:', err);
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
};

const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        user.address = req.body;
        await user.save();

        res.status(200).send('Endereço atualizado com sucesso');
    } catch (error) {
        res.status(400).send('Erro ao atualizar endereço');
    }
};

const updateAdditionalInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        user.additionalInfo = {
            ...user.additionalInfo,
            ...req.body
        };

        await user.save();
        res.status(200).send('Informações adicionais atualizadas com sucesso');
    } catch (error) {
        res.status(400).send('Erro ao atualizar informações adicionais');
    }
};

const completeSetup = async (req, res) => {
    try {
        const user = req.user;
        user.profileCompleted = true;
        await user.save();
        res.status(200).send('Profile setup completed successfully.');
    } catch (error) {
        res.status(500).send('Error completing profile setup.');
    }
};

const checkAvailability = async (req, res) => {
    const { email, cpf } = req.body;

    try {
        const emailExists = await User.findOne({ email });
        const cpfExists = await User.findOne({ cpf });

        res.status(200).json({ emailExists: !!emailExists, cpfExists: !!cpfExists });
    } catch (error) {
        res.status(500).send('Erro ao verificar disponibilidade.');
    }
};

const getCandidato = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        res.send(user);
    } catch (error) {
        console.error('Erro ao buscar os dados do usuário', error);
        res.status(500).send('Erro ao buscar os dados do usuário');
    }
};

const requestEmailChange = async (req, res) => {
    const { email } = req.body;
    try {
        const user = req.user;
        const emailVerificationToken = createToken();
        user.emailVerificationToken = emailVerificationToken;
        user.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
        await user.save();

        sendConfirmationEmail(email, emailVerificationToken);

        res.status(200).send('Um token de verificação foi enviado para o novo e-mail.');
    } catch (error) {
        console.error('Erro ao solicitar a alteração de e-mail:', error);
        res.status(500).send('Erro ao solicitar a alteração de e-mail.');
    }
};

const verifyEmailToken = async (req, res) => {
    const { email, verificationToken } = req.body;
    try {
        const user = await User.findOne({
            _id: req.user._id,
            emailVerificationToken: verificationToken,
            tokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send('Token inválido ou expirado.');
        }

        user.email = email;
        user.emailVerificationToken = undefined;
        user.tokenExpiry = undefined;
        await user.save();

        res.status(200).send('E-mail verificado com sucesso!');
    } catch (error) {
        console.error('Erro ao verificar o token:', error);
        res.status(500).send('Erro ao verificar o token.');
    }
};

const resendEmailToken = async (req, res) => {
    const { email } = req.body;
    try {
        const user = req.user;
        const emailVerificationToken = createToken();
        user.emailVerificationToken = emailVerificationToken;
        user.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
        await user.save();

        sendConfirmationEmail(email, emailVerificationToken);

        res.status(200).send('Token reenviado com sucesso!');
    } catch (error) {
        console.error('Erro ao reenviar o token de e-mail:', error);
        res.status(500).send('Erro ao reenviar o token de e-mail.');
    }
};

// Adicionar uma experiência
const addExperience = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        if (!user.experiences) {
            user.experiences = [];
        }

        user.experiences.push(req.body);
        await user.save();
        res.status(200).send({ message: 'Experiência adicionada com sucesso!' });
    } catch (error) {
        console.error('Erro ao adicionar experiência:', error);
        res.status(500).send('Erro ao adicionar experiência');
    }
};

// Atualizar uma experiência
const updateExperience = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        const experience = user.experiences.id(req.params.expId);
        if (!experience) return res.status(404).send('Experiência não encontrada');

        Object.assign(experience, req.body);
        await user.save();
        res.status(200).send({ message: 'Experiência atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar experiência:', error);
        res.status(500).send('Erro ao atualizar experiência');
    }
};

// Excluir uma experiência
const deleteExperience = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { experiences: { _id: req.params.expId } } },
            { new: true }
        );
        res.status(200).send({ message: 'Experiência removida com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover experiência:', error);
        res.status(500).send('Erro ao remover experiência');
    }
};

// Buscar todas as experiências do usuário
const getExperiences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('experiences');
        if (!user) return res.status(404).send('Usuário não encontrado');
        res.status(200).send(user.experiences);
    } catch (error) {
        console.error('Erro ao buscar experiências:', error);
        res.status(500).send('Erro ao buscar experiências');
    }
};

// Função para obter uma experiência específica pelo ID
const getExperienceById = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        const experience = user.experiences.id(req.params.expId);
        if (!experience) return res.status(404).send('Experiência não encontrada');

        res.status(200).json(experience);
    } catch (error) {
        console.error('Erro ao buscar a experiência:', error);
        res.status(500).send('Erro ao buscar a experiência');
    }
};

// Adicionar uma experiência
const addFormacao = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        if (!user.formacao) {
            user.formacao = [];
        }

        user.formacao.push(req.body);
        await user.save();
        res.status(200).send({ message: 'Formação adicionada com sucesso!' });
    } catch (error) {
        console.error('Erro ao adicionar Formação:', error);
        res.status(500).send('Erro ao adicionar Formação');
    }
};

// Atualizar uma experiência
const updateFormacao = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        const formacao = user.formacao.id(req.params.formacaoId);
        if (!formacao) return res.status(404).send('Formação não encontrada');

        Object.assign(formacao, req.body);
        await user.save();
        res.status(200).send({ message: 'Formação atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar Formação:', error);
        res.status(500).send('Erro ao atualizar Formação');
    }
};

// Excluir uma experiência
const deleteFormacao = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { formacao: { _id: req.params.formacaoId } } },
            { new: true }
        );
        res.status(200).send({ message: 'Formação removida com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover Formação:', error);
        res.status(500).send('Erro ao remover Formação');
    }
};

// Buscar todas as experiências do usuário
const getFormacao = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('formacao');
        if (!user) return res.status(404).send('Usuário não encontrado');
        res.status(200).send(user.formacao);
    } catch (error) {
        console.error('Erro ao buscar Formação:', error);
        res.status(500).send('Erro ao buscar Formação');
    }
};

// Função para obter uma experiência específica pelo ID
const getFormacaoById = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        const formacao = user.formacao.id(req.params.formacaoId);
        if (!formacao) return res.status(404).send('Formação não encontrada');

        res.status(200).json(formacao);
    } catch (error) {
        console.error('Erro ao buscar a formação:', error);
        res.status(500).send('Erro ao buscar a formação');
    }
};

module.exports = {
    updateProfilePicture,
    updateCandidato,
    updateAddress,
    updateAdditionalInfo,
    completeSetup,
    checkAvailability,
    getCandidato,
    requestEmailChange,
    verifyEmailToken,
    resendEmailToken,
    addExperience,
    updateExperience,
    deleteExperience,
    getExperiences,
    getExperienceById,
    addFormacao,
    updateFormacao,
    deleteFormacao,
    getFormacao,
    getFormacaoById
};
