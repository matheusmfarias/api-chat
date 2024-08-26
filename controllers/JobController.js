const Job = require('../models/Job');

const getJobs = async (req, res) => {
    console.log('getJobs chamado');
    const { page = 1, limit = 10, search = '', filterStatus = '', sortColumn = 'cargo', sortDirection = 'asc' } = req.query;
    const query = {};

    if (search) {
        query.$or = [
            { cargo: new RegExp(search, 'i') },
            { local: new RegExp(search, 'i') },
            { modalidade: new RegExp(search, 'i') },
            { tipo: new RegExp(search, 'i') },
        ];
    }

    if (filterStatus === 'active') {
        query.isDisabled = false;
    } else if (filterStatus === 'inactive') {
        query.isDisabled = true;
    }

    const sortOptions = {
        [sortColumn]: sortDirection === 'asc' ? 1 : -1
    };

    try {
        console.log('Query:', query);
        const jobs = await Job.find(query)
            .sort(sortOptions)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .exec();
        
        const count = await Job.countDocuments(query);
        console.log('Vagas encontradas:', jobs);

        res.json({
            jobs,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page)
        });
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
