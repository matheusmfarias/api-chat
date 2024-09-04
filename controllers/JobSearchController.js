const Job = require('../models/Job');

const getJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const filter = req.query.filter;
        const filters = { status: true }; // Apenas vagas ativas

        // Filtrar por título da vaga (cargo)
        if (keyword) {
            filters.title = { $regex: keyword, $options: 'i' }; // Busca insensível a maiúsculas/minúsculas
        }

        // Verifica se o filtro (cidade, estado, tipo ou modelo) está presente e aplica o filtro apropriado
        if (filter) {
            const filterRegex = { $regex: filter, $options: 'i' }; // Filtro insensível a maiúsculas e capturando qualquer parte da palavra

            // Aplica o filtro diretamente em 'location' como string
            filters.$or = [
                { location: filterRegex },      // Filtrar por cidade e estado juntos
                { modality: filterRegex },      // Filtrar por modalidade (Presencial, Remoto, Híbrido)
                { type: filterRegex }           // Filtrar por tipo (Efetivo, Estágio, etc.)
            ];
        }

        // Realiza a busca com os filtros aplicados
        const jobs = await Job.find(filters)
            .select('title location modality type description responsibilities qualifications requiriments additionalInfo salary pcd identifyCompany company')
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
