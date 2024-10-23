const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ExperienceSchema = new mongoose.Schema({
    empresa: { type: String, required: true },
    mesInicial: { type: String },
    anoInicial: { type: Number },
    mesFinal: { type: String },
    anoFinal: { type: Number },
    funcao: { type: String },
    atividades: { type: String },
    trabalhoAtualmente: { type: Boolean, default: false }
});

const FormacaoSchema = new mongoose.Schema({
    instituicao: { type: String, required: true },
    mesInicial: { type: String },
    anoInicial: { type: Number },
    mesFinal: { type: String },
    anoFinal: { type: Number },
    escolaridade: { type: String },
    curso: { type: String },
    grau: { type: String },
    situacao: { type: String }
});

const UserSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    sobrenome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    nascimento: { type: Date, required: false },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    emailVerificationToken: { type: String },
    tokenExpiry: { type: Date },
    lastAccess: { type: Date },
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
        rg: { type: String },
        cnh: { type: Boolean }, // Alterado para Boolean
        cnhTypes: [{ type: String }] // Mantido como array de strings
    },
    experiences: { type: [ExperienceSchema], default: [] },
    formacao: { type: [FormacaoSchema], default: [] },
    cursos: { type: [String], default: [] },
    habilidadesProfissionais: { type: [String], default: [] },
    habilidadesComportamentais: { type: [String], default: [] },
    objetivos: { type: [String], default: [] },
    profileCompleted: { type: Boolean, default: false }
});

UserSchema.methods.comparePassword = function (senha) {
    return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User', UserSchema);
