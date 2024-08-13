const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ExperienceSchema = new mongoose.Schema({
    empresa: { type: String, required: true },
    mesInicial: { type: String, required: true },
    anoInicial: { type: Number, required: true },
    mesFinal: { type: String, required: false },
    anoFinal: { type: Number, required: false },
    funcao: { type: String, required: true },
    atividades: { type: String, required: true },
    trabalhoAtualmente: { type: Boolean, required: true, default: false }
});

const FormacaoSchema = new mongoose.Schema({
    instituicao: { type: String, required: true },
    escolaridade: { type: String, required: true },
    curso: { type: String, required: false },
    grau: { type: String },
    situacao: { type: String, required: true }
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
