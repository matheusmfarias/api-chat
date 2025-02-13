const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    modality: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: Boolean, default: true },
    publicationDate: { type: Date, default: Date.now },
    description: { type: String },
    responsibilities: { type: String },
    qualifications: { type: String },
    additionalInfo: { type: String },
    requirements: { type: String },
    offers: { type: String },
    pcd: { type: Boolean, default: false },
    salary: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    identifyCompany: { type: Boolean, default: true },
    closingDate: { type: Date }
});

module.exports = mongoose.model('Job', JobSchema);