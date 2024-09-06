const Job = require('../models/Job');

const getJobs = async (req, res) => {
    try {
        const { keyword, filter, state, city, modality, type, pcd, minSalary, maxSalary } = req.query;
        const filters = { status: true }; // Apenas vagas ativas

        // Filtrar por título da vaga (cargo)
        if (keyword) {
            filters.title = { $regex: keyword, $options: 'i' }; // Busca insensível a maiúsculas/minúsculas
        }

        // Verifica filtros adicionais
        if (filter) {
            const filterRegex = { $regex: filter, $options: 'i' }; // Filtro insensível a maiúsculas e minúsculas
            filters.$or = [
                { location: filterRegex },      // Filtrar por cidade e estado
                { modality: filterRegex },      // Filtrar por modalidade
                { type: filterRegex }           // Filtrar por tipo
            ];
        }

        // Filtro por estado
        if (state) {
            filters.location = { $regex: state, $options: 'i' };
        }

        // Filtro por cidade
        if (city) {
            filters.location = { $regex: city, $options: 'i' };
        }

        // Filtro por modalidade
        if (modality) {
            filters.modality = modality;
        }

        // Filtro por tipo de vaga
        if (type) {
            filters.type = type;
        }

        // Filtro por PcD
        if (pcd !== undefined) {
            filters.pcd = pcd === 'true';
        }

        // Filtro por faixa salarial
        if (minSalary || maxSalary) {
            filters.salary = {};
            if (minSalary) {
                filters.salary.$gte = Number(minSalary);
            }
            if (maxSalary) {
                filters.salary.$lte = Number(maxSalary);
            }
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
