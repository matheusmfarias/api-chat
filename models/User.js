const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    sobrenome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    nascimento: { type: Date, required: false },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    emailVerificationToken: {
        type: String
    },
    tokenExpiry: { type: Date },
    profilePicture: { type: String },
    address: {
        street: { type: String },
        number: { type: String },
        district: { type: String },
        city: { type: String }
    },
    additionalInfo: {
        maritalStatus: { type: String },
        contactPhone: { type: String },
        backupPhone: { type: String },
        rg: { type: String, unique: true },
        cnh: { type: String },
        cnhTypes: [{ type: String }]
    },
    profileCompleted: { type: Boolean, default: false }
});


UserSchema.methods.comparePassword = function (senha) {
    return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User', UserSchema);
