const Job = require('../models/Job');

const getJobs = async (req, res) => {
    try {
        const { keyword, modality, type, pcd, location } = req.query;
        const filters = { status: true }; // Apenas vagas ativas

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

        // Filtro por PCD
        if (pcd) {
            filters.pcd = pcd === 'true';
        }

        // Filtro por localização
        if (location) {
            filters.location = { $regex: location, $options: 'i' };
        }

        // Realiza a busca com os filtros aplicados
        const jobs = await Job.find(filters)
            .select('title location modality type salary pcd identifyCompany company')
            .populate({
                path: 'company',
                select: 'nome' // Seleciona apenas o nome da empresa
            });

        res.json(jobs.length ? jobs : []);
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        res.status(500).json({ error: 'Erro ao buscar vagas. Tente novamente mais tarde' });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate({
                path: 'company',
                select: 'nome' // Seleciona apenas o nome da empresa
            });

        if (!job) {
            return res.status(404).json({ error: 'Vaga não encontrada' });
        }

        res.json(job);
    } catch (error) {
        console.error('Erro ao buscar detalhes da vaga:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes da vaga. Tente novamente mais tarde' });
    }
};

module.exports = {
    getJobs,
    getJobById
};
