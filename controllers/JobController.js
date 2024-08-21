const Job = require('../models/Job');

const getJobs = async (req, res) => {
    const { title, location, modality, type, status, pcd, keyword } = req.query;

    let query = { company: req.user._id };

    // Busca no campo de cargo (title) usando a keyword
    if (keyword) {
        query.title = { $regex: keyword, $options: 'i' };
    }

    if (location) query.location = { $regex: location, $options: 'i' };
    if (modality) query.modality = modality;
    if (type) query.type = type;
    if (status) query.status = status;
    if (pcd) query.pcd = pcd === 'true';

    try {
        const jobs = await Job.find(query);
        return res.status(200).json(jobs);
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        return res.status(500).json({ error: 'Erro ao buscar vagas. Tente novamente mais tarde.' });
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
        console.error('Erro ao adicionar vaga:', error);
        res.status(500).json({ error: 'Erro ao adicionar vaga. Verifique os dados e tente novamente.' });
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
            return res.status(404).json({ error: 'Vaga não encontrada.' });
        }

        res.json(job);
    } catch (error) {
        console.error('Erro ao atualizar vaga:', error);
        res.status(500).json({ error: 'Erro ao atualizar vaga. Verifique os dados e tente novamente.' });
    }
};

const deleteJob = async (req, res) => {
    const { id } = req.params;

    try {
        const job = await Job.findByIdAndDelete(id);
        if (!job) {
            return res.status(404).json({ error: 'Vaga não encontrada.' });
        }
        res.json({ message: 'Vaga deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar vaga:', error);
        res.status(500).json({ error: 'Erro ao deletar vaga. Tente novamente mais tarde.' });
    }
};

const toggleJobStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ error: 'Vaga não encontrada.' });
        }

        job.status = job.status === 'Ativo' ? 'Inativa' : 'Ativo';
        await job.save();
        res.json(job);
    } catch (error) {
        console.error('Erro ao alterar status da vaga:', error);
        res.status(500).json({ error: 'Erro ao alterar status da vaga. Tente novamente mais tarde.' });
    }
};

module.exports = {
    getJobs,
    addJob,
    updateJob,
    deleteJob,
    toggleJobStatus
};
