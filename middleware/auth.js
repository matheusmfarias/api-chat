const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Company = require('../models/Company');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            throw new Error('Authorization header missing');
        }
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user;

        if (decoded.role === 'admin') {
            user = await Admin.findOne({ _id: decoded.userId });
        } else if (decoded.role === 'empresa') {
            user = await Company.findOne({ _id: decoded.companyId });
        } else {
            user = await User.findOne({ _id: decoded.userId });
        }

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;
        req.token = token;
        req.role = decoded.role;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        res.status(401).send("Por favor, autentique-se");
    }
};

module.exports = auth;
