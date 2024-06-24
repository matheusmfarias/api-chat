const User = require('../models/User');
const Admin = require('../models/Admin');

const admin = async (req, res, next) => {
    try {
        const user = req.role === 'admin' ? await Admin.findById(req.user._id) : await User.findById(req.user._id);
        if (!user || req.role !== 'admin') {
            return res.status(403).send('Acesso negado. Você não tem permissões de administrador.');
        }
        next();
    } catch (error) {
        res.status(500).send('Erro ao verificar permissões de administrador.');
    }
};

module.exports = admin;
