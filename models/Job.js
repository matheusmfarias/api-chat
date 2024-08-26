const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    cargo: { type: String, required: true },
    local: { type: String, required: true },
    modalidade: { type: String, required: true },
    tipo: { type: String, required: true },
    descricao: { type: String },
    responsabilidades: { type: String },
    qualificacoes: { type: String },
    infoAdicional: { type: String },
    requisitos: { type: String },
    beneficios: { type: String },
    pcd: { type: Boolean, default: false },
    salario: { type: String },
    isDisabled: { type: Boolean, default: false },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
});

module.exports = mongoose.model('Job', JobSchema);
