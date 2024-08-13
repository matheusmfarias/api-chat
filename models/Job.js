const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    modality: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, default: 'Inativo' },
    description: { type: String },
    responsibilities: { type: String },
    qualifications: { type: String },
    additionalInfo: { type: String },
    requirements: { type: String },
    offers: { type: String },
    pcd: { type: String, default: 'Inativo' },
    salary: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
});

module.exports = mongoose.model('Job', JobSchema);
