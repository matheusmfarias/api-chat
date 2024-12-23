const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CompanySchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cnpj: { type: String, required: true, unique: true },
    setor: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    logo: { type: String },
    status: { type: Boolean }
});

CompanySchema.methods.comparePassword = function (senha) {
    return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('Company', CompanySchema);
