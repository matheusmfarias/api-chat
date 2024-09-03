const Job = require('../models/Job');

const getJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const filters = { status: true }; // Apenas vagas ativas

        if (keyword) {
            filters.title = { $regex: keyword, $options: 'i' };
        }

        const jobs = await Job.find(filters)
            .select('title location modality type publicationDate description salary pcd identifyCompany company')
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

module.exports = {
    getJobs
};
