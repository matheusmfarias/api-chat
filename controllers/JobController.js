const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');

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
const getJobsWithApplications = async (req, res) => {
    try {
      const companyId = req.user._id;
  
      // Obter as vagas da empresa
      const jobs = await Job.find({ company: companyId });
  
      // Obter as candidaturas para cada vaga
      const jobsWithApplications = await Promise.all(
        jobs.map(async (job) => {
          const applications = await JobApplication.find({ job: job._id }).populate('user', 'nome sobrenome email profilePicture experiences formacao');
          return { job, applications };
        })
      );
  
      res.json(jobsWithApplications);
    } catch (error) {
      console.error('Erro ao obter vagas com candidaturas:', error);
      res.status(500).json({ error: 'Erro ao obter vagas com candidaturas.' });
    }
  };

module.exports = {
    getJobs,
    addJob,
    updateJob,
    deleteJob,
    toggleJobStatus,
    submitCurriculum,
    getJobsWithApplications
};