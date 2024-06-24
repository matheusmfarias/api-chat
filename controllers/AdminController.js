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

module.exports = {
    createAdmin
};
