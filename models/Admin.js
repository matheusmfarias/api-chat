const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' }
});

AdminSchema.methods.comparePassword = function (senha) {
    return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('Admin', AdminSchema);
