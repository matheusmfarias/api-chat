const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const createAdmin = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        const hashedSenha = await bcrypt.hash(senha, 10);
        const admin = new Admin({ nome, email, senha: hashedSenha });
        await admin.save();
        res.status(201).send('Admin criado com sucesso');
    } catch (error) {
        console.error('Erro ao criar admin:', error);
        res.status(500).send('Erro ao criar admin.');
    }
};

const getAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id);
        if (!admin) return res.status(404).send('Administrador não encontrado');

        res.send(admin);
    } catch (error) {
        console.error('Erro ao buscar os dados do administrador', error);
        res.status(500).send('Erro ao buscar os dados do administrador');
    }
};

const changeEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Validação do campo de e-mail
        if (!email || !email.includes('@')) {
            return res.status(400).send('E-mail inválido.');
        }

        // Busca o admin no banco de dados
        const admin = await Admin.findById(req.user._id);
        if (!admin) return res.status(404).send('Administrador não encontrado.');

        // Atualiza o e-mail
        admin.email = email;
        await admin.save();

        res.status(200).send('E-mail atualizado com sucesso.');
    } catch (error) {
        console.error('Erro ao atualizar o e-mail do administrador:', error);
        res.status(500).send('Erro ao atualizar o e-mail do administrador.');
    }
};

const changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        // Validação da nova senha
        if (!newPassword) {
            return res.status(400).send('A nova senha é obrigatória.');
        }

        // Busca o administrador no banco de dados
        const admin = await Admin.findById(req.user._id);
        if (!admin) {
            return res.status(404).send('Administrador não encontrado.');
        }

        // Criptografa a nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.senha = hashedPassword;

        // Salva as alterações no banco
        await admin.save();

        res.status(200).send('Senha atualizada com sucesso.');
    } catch (error) {
        console.error('Erro ao alterar a senha do administrador:', error);
        res.status(500).send('Erro ao alterar a senha do administrador.');
    }
};

module.exports = {
    createAdmin,
    getAdmin,
    changeEmail,
    changePassword
};
