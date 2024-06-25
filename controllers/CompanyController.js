const Company = require('../models/Company');

const getCurrentCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.user._id); // Certifique-se de usar req.user._id
        if (!company) {
            return res.status(404).send('Empresa não encontrada');
        }
        res.send(company);
    } catch (error) {
        res.status(500).send('Erro ao buscar dados da empresa');
    }
};

const addCompany = async (req, res) => {
    try {
        const { nome, cnpj, setor, email, senha } = req.body;

        // Verifica se o CNPJ ou email já existem
        const existingCompany = await Company.findOne({ $or: [{ cnpj }, { email }] });
        if (existingCompany) {
            return res.status(400).json({ error: 'CNPJ ou email já cadastrados' });
        }

        const newCompany = new Company({ nome, cnpj, setor, email, senha });
        if (req.file) {
            newCompany.logo = req.file.path;
        }
        await newCompany.save();

        res.status(201).json(newCompany);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar empresa' });
    }
};

const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.send(companies);
    } catch (error) {
        res.status(500).send('Erro ao buscar empresas');
    }
};

const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (req.file) {
            updates.logo = req.file.path;
        }

        const company = await Company.findByIdAndUpdate(id, updates, { new: true });
        if (!company) {
            return res.status(404).send('Empresa não encontrada');
        }
        res.send(company);
    } catch (error) {
        res.status(500).send('Erro ao atualizar empresa');
    }
};

const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByIdAndDelete(id);
        if (!company) {
            return res.status(404).send('Empresa não encontrada');
        }
        res.send('Empresa deletada com sucesso');
    } catch (error) {
        res.status(500).send('Erro ao deletar empresa');
    }
};

module.exports = {
    getCurrentCompany,
    addCompany,
    getCompanies,
    updateCompany,
    deleteCompany
};
