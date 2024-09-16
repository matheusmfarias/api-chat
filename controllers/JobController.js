const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const mongoose = require('mongoose');

const getJobs = async (req, res) => {
    try {
        const { keyword, modality, type, status, pcd, location } = req.query;
        const filters = { company: req.user._id };

        // Filtro por título
        if (keyword) {
            filters.title = { $regex: keyword, $options: 'i' };
        }

        // Filtro por modalidade (pode ser múltiplo)
        if (modality) {
            filters.modality = Array.isArray(modality) ? { $in: modality } : modality;
        }

        // Filtro por tipo (pode ser múltiplo)
        if (type) {
            filters.type = Array.isArray(type) ? { $in: type } : type;
        }

        // Filtro por status
        if (status) {
            filters.status = status === 'true';
        }

        // Filtro por PCD
        if (pcd) {
            filters.pcd = pcd === 'true';
        }

        // Filtro por localização
        if (location) {
            filters.location = { $regex: location, $options: 'i' };
        }

        const jobs = await Job.find(filters).populate('company', 'nome');

        res.json(jobs.length ? jobs : []);
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        res.status(500).json({ error: 'Erro ao buscar vagas. Tente novamente mais tarde.' });
    }
};

const addJob = async (req, res) => {
    const {
        title, location, modality, type, status, publicationDate, description,
        responsibilities, qualifications, additionalInfo, requirements,
        offers, pcd, salary, identifyCompany
    } = req.body;

    try {
        const newJob = new Job({
            title,
            location,
            modality,
            type,
            status,
            publicationDate,
            description,
            responsibilities,
            qualifications,
            additionalInfo,
            requirements,
            offers,
            pcd,
            salary,
            identifyCompany,
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
        title, location, modality, type, status, publicationDate, description,
        responsibilities, qualifications, additionalInfo, requirements,
        offers, pcd, salary, identifyCompany
    } = req.body;

    try {
        const job = await Job.findByIdAndUpdate(
            id,
            {
                title, location, modality, type, status, publicationDate, description,
                responsibilities, qualifications, additionalInfo, requirements,
                offers, pcd, salary, identifyCompany
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

        job.status = job.status === 'Ativo' ? 'Inativo' : 'Ativo';
        await job.save();
        res.json(job);
    } catch (error) {
        console.error('Erro ao alterar status da vaga:', error);
        res.status(500).json({ error: 'Erro ao alterar status da vaga. Tente novamente mais tarde.' });
    }
};

// Função para submeter o currículo à vaga
const submitCurriculum = async (req, res) => {
    try {
        const jobId = req.params.id; // O ID da vaga da URL
        const userId = req.user._id; // O ID do usuário autenticado

        // Verifica se a vaga existe
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Vaga não encontrada.' });
        }

        // Verifica se o usuário já submeteu o currículo para essa vaga
        const existingApplication = await JobApplication.findOne({ job: jobId, user: userId });
        if (existingApplication) {
            return res.status(400).json({ error: 'Você já submeteu um currículo para esta vaga.' });
        }

        // Cria a nova submissão de currículo
        const newApplication = new JobApplication({
            job: jobId,
            user: userId,
        });

        await newApplication.save();

        res.status(201).json({ message: 'Currículo submetido com sucesso!' });
    } catch (error) {
        console.error('Erro ao submeter currículo:', error);
        res.status(500).json({ error: 'Erro ao submeter currículo. Tente novamente mais tarde.' });
    }
};

// Função para obter as vagas com as candidaturas
const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { page = 1, limit = 10, searchTerm } = req.query;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: 'ID da vaga inválido' });
        }

        // Filtros iniciais para a vaga específica
        const filters = { job: new mongoose.Types.ObjectId(jobId) };

        // Realiza a busca inicial para obter candidaturas
        let applications = await JobApplication.find(filters)
            .populate('user', 'nome sobrenome email profilePicture experiences formacao') // Popula os campos do usuário
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalApplications = await JobApplication.countDocuments(filters);

        // Agora, se houver um termo de busca, vamos filtrar os resultados já populados
        if (searchTerm && searchTerm.trim() !== "") {
            const regex = new RegExp(searchTerm, 'i'); // 'i' para case-insensitive

            applications = applications.filter((application) => {
                const { user } = application;
                const matchesName = regex.test(user.nome) || regex.test(user.sobrenome);
                const matchesExperience = user.experiences?.some(exp => regex.test(exp.empresa) || regex.test(exp.funcao));
                const matchesEducation = user.formacao?.some(edu => regex.test(edu.instituicao) || regex.test(edu.escolaridade) || regex.test(edu.curso));

                // Retorna true se alguma das condições for atendida
                return matchesName || matchesExperience || matchesEducation;
            });
        }

        return res.json({
            candidates: applications,
            totalPages: Math.ceil(totalApplications / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Erro ao buscar candidatos para a vaga:', error);
        res.status(500).json({ error: 'Erro ao buscar candidatos para a vaga.' });
    }
};

module.exports = {
    getJobs,
    addJob,
    updateJob,
    deleteJob,
    toggleJobStatus,
    submitCurriculum,
    getJobApplications
};