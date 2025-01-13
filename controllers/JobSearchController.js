const Job = require('../models/Job');

const getJobs = async (req, res) => {
    try {
        const {
            keyword,
            state,
            city,
            modality,
            type,
            pcd,
            minSalary,
            maxSalary,
            page = 1,  // Página padrão 1
            limit = 10 // Limite padrão 10
        } = req.query;

        const filters = { status: true }; // Apenas vagas ativas

        // Filtrar por título da vaga e combinar com outros campos
        if (keyword) {
            filters.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { location: { $regex: keyword, $options: 'i' } },
                { modality: { $regex: keyword, $options: 'i' } },
                { type: { $regex: keyword, $options: 'i' } }
            ];
        }

        // Filtro por estado e cidade
        if (state && city) {
            filters.location = { $regex: `${city}, ${state}`, $options: 'i' };
        } else if (state) {
            filters.location = { $regex: state, $options: 'i' };
        } else if (city) {
            filters.location = { $regex: city, $options: 'i' };
        }

        // Filtro por modalidade, tipo e PcD
        if (modality) filters.modality = modality;
        if (type) filters.type = type;
        if (pcd !== undefined) filters.pcd = pcd === 'true';

        // Filtro por faixa salarial
        if (minSalary || maxSalary) {
            filters.salary = {};
            if (minSalary) filters.salary.$gte = Number(minSalary);
            if (maxSalary) filters.salary.$lte = Number(maxSalary);
        }

        // Cálculo de paginação
        const skip = (Number(page) - 1) * Number(limit);

        // Busca paginada e ordenada por data de publicação (mais recentes primeiro)
        const totalJobs = await Job.countDocuments(filters); // Conta total de vagas
        const jobs = await Job.find(filters)
            .select('title location modality type salary pcd identifyCompany company publicationDate')
            .populate({
                path: 'company',
                select: 'nome'
            })
            .sort({ publicationDate: -1 }) // Ordena por data de publicação (descendente)
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
