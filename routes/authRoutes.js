const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendConfirmationEmail } = require('../services/emailService');
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

// Login do usuário
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Verifica se o usuário existe
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send('E-mail ou senha incorretos!');
        }

        // Verifica se a senha está correta
        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(400).send('E-mail ou senha incorretos!');
        }

        // Verifica se o e-mail foi confirmado
        if (!user.isVerified) {
            return res.status(400).send('E-mail não confirmado. Por favor, verifique seu e-mail.');
        }

        // Cria um token JWT para o usuário
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Retorna o token ao cliente
        res.status(200).json({ token });

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).send('Erro ao fazer login. Por favor, tente novamente mais tarde.');
    }
});

router.post('/logout', (req, res) => {
    // Invalida o token no frontend removendo-o do localStorage
    res.status(200).send('Logout realizado com sucesso.');
});


module.exports = router;
