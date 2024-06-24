const Company = require('../models/Company');
const bcrypt = require('bcryptjs');

const getCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.user.companyId);
        if (!company) {
            return res.status(404).send('Empresa não encontrada');
        }
        res.send(company);
    } catch (error) {
        res.status(500).send('Erro ao buscar dados da empresa');
    }
}

const addCompany = async (req, res) => {
    try {
        const { nome, cnpj, setor, email, senha } = req.body;

        // Verifica se o CNPJ ou email já existem
        const existingCompany = await Company.findOne({ $or: [{ cnpj }, { email }] });
        if (existingCompany) {
            return res.status(400).json({ error: 'CNPJ ou email já cadastrados' });
        }

        const newCompany = new Company({ nome, cnpj, setor, email, senha });
        await newCompany.save();

        res.status(201).json(newCompany);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar empresa' });
    }
};

const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).send(companies);
    } catch (error) {
        res.status(500).send('Erro ao buscar empresas.');
    }
};

const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cnpj, setor, email, senha } = req.body;
        const updateData = { nome, cnpj, setor, email };

        if (senha) {
            updateData.senha = await bcrypt.hash(senha, 10);
        }
        if (req.file) {
            updateData.logo = `/uploads/${req.file.filename}`;
        }

        const company = await Company.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).send(company);
    } catch (error) {
        res.status(500).send('Erro ao atualizar empresa.');
    }
};

const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        await Company.findByIdAndDelete(id);
        res.status(200).send('Empresa deletada com sucesso');
    } catch (error) {
        res.status(500).send('Erro ao deletar empresa.');
    }
};

module.exports = {
    getCompany,
    addCompany,
    getCompanies,
    updateCompany,
    deleteCompany
};
