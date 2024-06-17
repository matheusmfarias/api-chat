const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    sobrenome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    nascimento: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    verificationToken: { type: String },
    tokenExpiry: { type: Date },
    isVerified: { type: Boolean, default: false }
});

UserSchema.methods.comparePassword = function (senha) {
    return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User', UserSchema);
