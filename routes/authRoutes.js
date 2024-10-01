const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Company = require('../models/Company');
const { sendConfirmationEmail } = require('../services/emailRegisterService');
const { sendChangePasswordEmail } = require('../services/emailChangePasswordService');
const { createToken, encrypt } = require('../services/tokenService');
const router = express.Router();

// Cadastro de usuário
router.post('/register', async (req, res) => {
    const { nome, sobrenome, cpf, nascimento, email, senha } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        const verificationToken = createToken();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        const user = new User({
            nome,
            sobrenome,
            cpf,
            nascimento,
            email,
            senha: hashedPassword,
            verificationToken,
            tokenExpiry
        });

        await user.save();

        sendConfirmationEmail(email, verificationToken);

        res.status(201).send('Usuário cadastrado com sucesso! Verifique seu e-mail para confirmar o cadastro.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Verificação de token
router.post('/verify', async (req, res) => {
    const { email, token } = req.body;

    try {
        const user = await User.findOne({ email, verificationToken: token, tokenExpiry: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).send('Token inválido ou expirado.');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.tokenExpiry = undefined;
        await user.save();

        res.status(200).send('Verificação bem-sucedida.');
    } catch (error) {
        res.status(500).send('Erro ao verificar o token.');
    }
});

// Reenvio de token
router.post('/resend-token', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Usuário não encontrado.');
        }
        if (user.isVerified) {
            return res.status(400).send('Usuário já verificado.');
        }

        const verificationToken = createToken();
        user.verificationToken = verificationToken;
        user.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
        await user.save();

        sendConfirmationEmail(email, verificationToken);

        res.status(200).send('Token reenviado com sucesso!');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Verificação do status de verificação do usuário
router.get('/check-verification', async (req, res) => {
    const { email } = req.query;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Usuário não encontrado.');
        }

        res.status(200).send({ isVerified: user.isVerified });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Login do usuário ou administrador
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        let user = await User.findOne({ email });
        let role = 'user';

        // Se o usuário não foi encontrado, procure na coleção de administradores
        if (!user) {
            user = await Admin.findOne({ email });
            role = 'admin';
        }

        // Verifica se o usuário existe
        if (!user) {
            return res.status(400).send('E-mail ou senha incorretos!');
        }

        // Verifica se a senha está correta
        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(400).send('E-mail ou senha incorretos!');
        }

        // Verifica se o e-mail foi confirmado (aplica-se apenas para usuários normais)
        if (role === 'user' && !user.isVerified) {
            return res.status(400).send('E-mail não confirmado. Por favor, verifique seu e-mail.');
        }

        // Cria um token JWT para o usuário ou administrador
        const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Verifica se é o primeiro login do usuário (aplica-se apenas para usuários normais)
        const firstLogin = role === 'user' ? !user.profileCompleted : false;

        // Retorna o token e o status do primeiro login ao cliente
        res.status(200).json({ token, firstLogin, role });

    } catch (error) {
        res.status(500).send('Erro ao fazer login. Por favor, tente novamente mais tarde.');
    }
});

// Verifica se e-mail existe
router.post('/verifica-email', async (req, res) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });

        // Se o usuário não foi encontrado, procure na coleção de administradores
        if (!user) {
            user = await Admin.findOne({ email });
        }

        // Verifica se o usuário existe
        if (!user) {
            return res.status(400).send('E-mail não cadastrado!');
        }

        const emailVerificationToken = createToken();

        user.emailVerificationToken = emailVerificationToken;

        user.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        await user.save();

        sendChangePasswordEmail(email, user.nome, emailVerificationToken);

        res.status(200).send('Um código de verificação foi enviado para o novo e-mail.');
    } catch (error) {
        res.status(500).send('Erro durante a solicitação. Por favor, tente novamente mais tarde.');
    }
});

router.post('/valida-token-recuperacao', async (req, res) => {
    const { token } = req.body;

    try {
        let user = await User.findOne({ emailVerificationToken: token, tokenExpiry: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).send('Token inválido ou expirado.');
        }

        res.status(200).send('Token válido.');
    } catch (error) {
        res.status(500).send('Erro ao validar o token.');
    }
});

router.post('/redefinir-senha', async (req, res) => {
    const { token, novaSenha } = req.body;

    try {
        // Localiza o usuário pelo token e verifica se o token ainda é válido
        let user = await User.findOne({ emailVerificationToken: token, tokenExpiry: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).send('Token inválido ou expirado.');
        }

        // Gerar o hash da nova senha antes de salvar
        const hashedPassword = await bcrypt.hash(novaSenha, 10);

        // Atualiza a senha do usuário
        user.senha = hashedPassword;
        user.emailVerificationToken = undefined;  // Remove o token após o uso
        user.tokenExpiry = undefined;

        // Salva o usuário com a nova senha hashada
        await user.save();

        res.status(200).send('Senha alterada com sucesso.');
    } catch (error) {
        console.error('Erro ao redefinir a senha:', error);
        res.status(500).send('Erro ao redefinir a senha.');
    }
});

router.post('/logout', (req, res) => {
    // Invalida o token no frontend removendo-o do localStorage
    res.status(200).send('Logout realizado com sucesso.');
});

// Login da empresa
router.post('/login-empresa', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Verifica se a empresa existe
        const empresa = await Company.findOne({ email });

        if (!empresa) {
            return res.status(400).send('E-mail ou senha incorretos!');
        }

        // Verifica se a empresa está desabilitada
        if (!empresa.status) {
            return res.status(403).send('Erro ao acessar a conta. Entre em contato com a ACI.');
        }

        // Verifica se a senha está correta
        const isPasswordValid = await bcrypt.compare(senha, empresa.senha);
        if (!isPasswordValid) {
            return res.status(400).send('E-mail ou senha incorretos!');
        }

        // Cria um token JWT para a empresa
        const token = jwt.sign({ companyId: empresa._id, role: 'empresa' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Retorna o token e o papel ao cliente
        res.status(200).json({ token, role: 'empresa' });

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).send('Erro ao fazer login. Por favor, tente novamente mais tarde.');
    }
});

module.exports = router;
