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
        // Busca a vaga existente para verificar o status atual
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ error: 'Vaga não encontrada.' });
        }

        // Atualiza os campos da vaga
        job.title = title;
        job.location = location;
        job.modality = modality;
        job.type = type;
        job.publicationDate = publicationDate;
        job.description = description;
        job.responsibilities = responsibilities;
        job.qualifications = qualifications;
        job.additionalInfo = additionalInfo;
        job.requirements = requirements;
        job.offers = offers;
        job.pcd = pcd;
        job.salary = salary;
        job.identifyCompany = identifyCompany;

        // Verifica se o status está sendo alterado
        if (status !== undefined && status !== job.status) {
            job.status = status;

            // Se o status foi alterado para false (vaga inativa), define a data de encerramento
            if (!status) {
                job.closingDate = new Date();  // Define a data de encerramento
            } else {
                job.closingDate = null;  // Remove a data de encerramento se a vaga for ativada
            }
        }

        // Salva a vaga atualizada
        await job.save();

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

        // Alterna o status da vaga
        job.status = !job.status;

        // Se a vaga for desativada, define a data de encerramento
        if (!job.status) {
            job.closingDate = new Date();  // Define a data de encerramento como a data atual
        } else {
            job.closingDate = null;  // Remove a data de encerramento se a vaga for reativada
        }

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
        res.status(500).json({ error });
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

        // Realiza a busca inicial para obter candidaturas sem aplicar filtros de busca
        let applications = await JobApplication.find(filters)
            .populate('user', 'nome sobrenome email profilePicture experiences formacao')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Contagem do total de candidaturas (antes da aplicação do filtro de busca)
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

        // Total de candidatos após a aplicação do filtro
        const filteredApplicationsCount = applications.length;

        return res.json({
            candidates: applications,
            totalPages: Math.ceil(totalApplications / limit),  // Número total de páginas considerando todas as candidaturas
            currentPage: parseInt(page),
            filteredCount: filteredApplicationsCount, // Retorna a contagem após o filtro
        });
    } catch (error) {
        console.error('Erro ao buscar candidatos para a vaga:', error);
        res.status(500).json({ error: 'Erro ao buscar candidatos para a vaga.' });
    }
};

const getJobsByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const page = parseInt(req.query.page) || 1; // Página atual (default 1)
        const limit = parseInt(req.query.limit) || 10; // Limite de vagas por página (default 10)
        const skip = (page - 1) * limit; // Número de vagas a pular

        // Busca as vagas da empresa com paginação
        const jobs = await Job.find({ company: companyId })
            .skip(skip)
            .limit(limit);

        // Contagem total de vagas para calcular o número de páginas
        const totalJobs = await Job.countDocuments({ company: companyId });

        if (!jobs) {
            return res.status(404).send('Vagas não encontradas');
        }

        // Retorna as vagas com as informações de paginação
        res.json({
            jobs,
            currentPage: page,
            totalPages: Math.ceil(totalJobs / limit),
            totalJobs: totalJobs
        });
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        res.status(500).send('Erro ao buscar vagas da empresa');
    }
};


const getCandidatesByJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const page = parseInt(req.query.page) || 1; // Página atual (default 1)
        const limit = parseInt(req.query.limit) || 10; // Limite de candidatos por página (default 10)
        const skip = (page - 1) * limit; // Número de candidatos a pular

        // Busca os candidatos da vaga com paginação
        const candidates = await JobApplication.find({ job: jobId })
            .populate('user', 'nome sobrenome email')
            .skip(skip)
            .limit(limit);

        // Contagem total de candidatos para calcular o número de páginas
        const totalCandidates = await JobApplication.countDocuments({ job: jobId });

        if (!candidates) {
            return res.status(404).send('Candidatos não encontrados');
        }

        // Retorna os candidatos com as informações de paginação
        res.json({
            candidates,
            currentPage: page,
            totalPages: Math.ceil(totalCandidates / limit),
            totalCandidates: totalCandidates
        });
    } catch (error) {
        console.error('Erro ao buscar candidatos:', error);
        res.status(500).send('Erro ao buscar candidatos da vaga');
    }
};


module.exports = {
    getJobs,
    addJob,
    updateJob,
    deleteJob,
    toggleJobStatus,
    submitCurriculum,
    getJobApplications,
    getJobsByCompany,
    getCandidatesByJob
};