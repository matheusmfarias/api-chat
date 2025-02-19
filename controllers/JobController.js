const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const mongoose = require('mongoose');

const getJobs = async (req, res) => {
    try {
        const { keyword, modality, type, status, pcd, state, city, page = 1, limit = 9 } = req.query;

        const filters = { company: req.user._id };

        if (keyword) {
            filters.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { state: { $regex: keyword, $options: 'i' } },
                { city: { $regex: keyword, $options: 'i' } },
                { modality: { $regex: keyword, $options: 'i' } },
                { type: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (modality) {
            const modalities = Array.isArray(modality) ? modality : [modality];
            filters.modality = { $in: modalities };
        }

        if (type) {
            const types = Array.isArray(type) ? type : [type];
            filters.type = { $in: types };
        }

        if (status) {
            filters.status = status === 'true';
        }

        if (pcd !== undefined) filters.pcd = pcd === 'true';

        if (state) {
            filters.state = { $regex: state, $options: 'i' };
        }
        if (city) {
            filters.city = { $regex: city, $options: 'i' };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const totalJobs = await Job.countDocuments(filters);
        const jobs = await Job.find(filters)
            .select('title state city modality type salary pcd identifyCompany company publicationDate closingDate status')
            .populate({
                path: 'company',
                select: 'nome'
            })
            .sort({ publicationDate: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            jobs,
            totalJobs,
            totalPages: Math.ceil(totalJobs / Number(limit)),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error('Erro ao buscar vagas:', error.message, error.stack);
        res.status(500).json({ error: 'Erro ao buscar vagas. Tente novamente mais tarde' });
    }
};

const addJob = async (req, res) => {
    const {
        title, state, city, modality, type, status, publicationDate, description,
        responsibilities, qualifications, additionalInfo, requirements,
        offers, pcd, salary, identifyCompany
    } = req.body;

    try {
        const newJob = new Job({
            title,
            state,
            city,
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
        title, state, city, modality, type, status, publicationDate, description,
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
        job.state = state;
        job.city = city;
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
        const { page = 1, limit = 9, keyword } = req.query;

        const regex = keyword ? new RegExp(keyword, 'i') : null;
        const skip = (Number(page) - 1) * Number(limit);

        // Pipeline do aggregate
        const pipeline = [
            { $match: { job: new mongoose.Types.ObjectId(jobId) } }, // Corrigido aqui
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' }, // Transforma array de usuários em objetos
        ];

        // Adiciona filtros ao pipeline se houver searchTerm
        if (regex) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'user.nome': regex },
                        { 'user.sobrenome': regex },
                        { 'user.experiences.empresa': regex },
                        { 'user.experiences.funcao': regex },
                        { 'user.formacao.instituicao': regex },
                        { 'user.formacao.curso': regex },
                    ],
                },
            });
        }

        // Adiciona paginação
        pipeline.push({ $sort: { submissionDate: -1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: Number(limit) });

        // Executa a agregação
        const applications = await JobApplication.aggregate(pipeline);

        // Conta o total sem paginação
        const totalApplicationsPipeline = pipeline.slice(0, -3); // Remove skip e limit
        totalApplicationsPipeline.push({ $count: 'total' });
        const totalApplicationsResult = await JobApplication.aggregate(totalApplicationsPipeline);
        const totalApplications = totalApplicationsResult[0]?.total || 0;

        res.status(200).json({
            applications,
            totalApplications,
            totalPages: Math.ceil(totalApplications / Number(limit)),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error('Erro ao buscar candidatos para a vaga:', error.message, error.stack);
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