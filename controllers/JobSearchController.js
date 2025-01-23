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
            page = 1,
            limit = 10
        } = req.query;

        const filters = { status: true }; // Apenas vagas ativas

        // Filtrar por título da vaga e combinar com outros campos
        if (keyword) {
            filters.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { state: { $regex: keyword, $options: 'i' } },
                { city: { $regex: keyword, $options: 'i' } },
                { modality: { $regex: keyword, $options: 'i' } },
                { type: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (state) {
            filters.state = { $regex: state, $options: 'i' };
        }
        if (city) {
            filters.city = { $regex: city, $options: 'i' };
        }

        if (modality) {
            const modalities = Array.isArray(modality) ? modality : [modality];
            filters.modality = { $in: modalities };
        }

        if (type) {
            const types = Array.isArray(type) ? type : [type];
            filters.type = { $in: types };
        }

        if (pcd !== undefined) filters.pcd = pcd === 'true';

        // Cálculo de paginação
        const skip = (Number(page) - 1) * Number(limit);

        // Busca paginada e ordenada por data de publicação (mais recentes primeiro)
        const totalJobs = await Job.countDocuments(filters); // Conta total de vagas
        const jobs = await Job.find(filters)
            .select('title state city modality type salary pcd identifyCompany company publicationDate')
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
                select: 'nome'
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
