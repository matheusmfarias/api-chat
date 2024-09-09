const Job = require('../models/Job');

const getJobs = async (req, res) => {
    try {
        const { keyword, state, city, modality, type, pcd, minSalary, maxSalary } = req.query;
        const filters = { status: true }; // Apenas vagas ativas

        // Filtrar por título da vaga (cargo) e combinar com outros campos
        if (keyword) {
            filters.$or = [
                { title: { $regex: keyword, $options: 'i' } }, // Busca por título (cargo)
                { location: { $regex: keyword, $options: 'i' } }, // Busca por local (estado/cidade)
                { modality: { $regex: keyword, $options: 'i' } }, // Busca por modalidade
                { type: { $regex: keyword, $options: 'i' } } // Busca por tipo
            ];
        }

        // Filtro por estado e cidade (combinado)
        if (state || city) {
            filters.location = {};
            if (state) {
                filters.location.$regex = state;
                filters.location.$options = 'i'; // Insensível a maiúsculas
            }
            if (city) {
                filters.location = { ...filters.location, $regex: city, $options: 'i' };
            }
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
