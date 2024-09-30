const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Company = require('../models/Company');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).send('Authorization header missing');
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user;

        // Verifica o tipo de usuário com base no papel (role)
        if (decoded.role === 'admin') {
            user = await Admin.findOne({ _id: decoded.userId });
        } else if (decoded.role === 'empresa') {
            user = await Company.findOne({ _id: decoded.companyId });
        } else {
            user = await User.findOne({ _id: decoded.userId });
        }

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Renova o token antes de passar para a próxima etapa
        const newToken = jwt.sign({ userId: user._id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.setHeader('Authorization', `Bearer ${newToken}`);

        // Adiciona os dados do usuário, token e role no req
        req.user = user;
        req.token = newToken;
        req.role = decoded.role;

        next();  // Passa para o próximo middleware ou rota
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).send("Por favor, autentique-se");
    }
};

module.exports = auth;
