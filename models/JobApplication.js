const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissionDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' }, // Status da candidatura: Pending, Reviewed, etc.
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
