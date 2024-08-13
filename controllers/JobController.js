const Job = require('../models/Job');

const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ company: req.user._id });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar vagas' });
    }
};

const addJob = async (req, res) => {
    const {
        title, location, modality, type, status, description,
        responsibilities, qualifications, additionalInfo, requirements,
        offers, pcd, salary
    } = req.body;

    try {
        const newJob = new Job({
            title,
            location,
            modality,
            type,
            status,
            description,
            responsibilities,
            qualifications,
            additionalInfo,
            requirements,
            offers,
            pcd,
            salary,
            company: req.user._id
        });

        await newJob.save();
        res.status(201).json(newJob);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar vaga' });
    }
};

const updateJob = async (req, res) => {
    const { id } = req.params;
    const {
        title, location, modality, type, status, description,
        responsibilities, qualifications, additionalInfo, requirements,
        offers, pcd, salary
    } = req.body;

    try {
        const job = await Job.findByIdAndUpdate(
            id,
            {
                title, location, modality, type, status, description,
                responsibilities, qualifications, additionalInfo, requirements,
                offers, pcd, salary
            },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ error: 'Vaga não encontrada' });
        }

        res.json(job);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar vaga' });
    }
};

const deleteJob = async (req, res) => {
    const { id } = req.params;

    try {
        const job = await Job.findByIdAndDelete(id);
        if (!job) {
            return res.status(404).json({ error: 'Vaga não encontrada' });
        }
        res.json({ message: 'Vaga deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar vaga' });
    }
};

const toggleJobStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ error: 'Vaga não encontrada' });
        }

        job.status = job.status === 'Ativo' ? 'Inativo' : 'Ativo';
        await job.save();
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alterar status da vaga' });
    }
};

module.exports = {
    getJobs,
    addJob,
    updateJob,
    deleteJob,
    toggleJobStatus
};
