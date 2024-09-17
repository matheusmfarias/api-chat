const Company = require('../models/Company');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const bcrypt = require('bcryptjs');
const { validateCNPJ } = require('../utils/validators');

const getCurrentCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.user._id);
        if (!company) {
            return res.status(404).send('Empresa não encontrada');
        }
        res.send(company);
    } catch (error) {
        res.status(500).send('Erro ao buscar dados da empresa');
    }
};

const addCompany = async (req, res) => {
    const { nome, cnpj, setor, email, senha, isDisabled } = req.body;
    console.log("Dados recebidos:", req.body);
    try {
        if (!nome || !cnpj || !setor || !email || !senha) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
        }

        if (!validateCNPJ(cnpj)) {
            return res.status(400).json({ error: 'CNPJ inválido!' });
        }

        const existingCompanyByCNPJ = await Company.findOne({ cnpj });
        if (existingCompanyByCNPJ) {
            return res.status(400).json({ error: 'CNPJ já cadastrado!' });
        }

        const existingCompanyByEmail = await Company.findOne({ email });
        if (existingCompanyByEmail) {
            return res.status(400).json({ error: 'Email já cadastrado!' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const newCompany = new Company({
            nome,
            cnpj,
            setor,
            email,
            senha: hashedPassword,
            isDisabled: isDisabled || false
        });

        await newCompany.save();

        res.status(201).json(newCompany);
    } catch (error) {
        console.error('Erro ao adicionar empresa:', error);
        res.status(500).json({ error: 'Erro ao adicionar empresa' });
    }
};

const getCompanies = async (req, res) => {
    const { page = 1, limit = 10, search = '', filterStatus = '', sortColumn = 'nome', sortDirection = 'asc' } = req.query;
    const query = {};

    if (search) {
        query.$or = [
            { nome: new RegExp(search, 'i') },
            { cnpj: new RegExp(search, 'i') },
            { setor: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') }
        ];
    }

    if (filterStatus === 'active') {
        query.isDisabled = false;
    } else if (filterStatus === 'inactive') {
        query.isDisabled = true;
    }

    const sortOptions = {
        [sortColumn]: sortDirection === 'asc' ? 1 : -1
    };

    try {
        const companies = await Company.find(query)
            .sort(sortOptions)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .exec();

        const count = await Company.countDocuments(query);

        res.json({
            companies,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).send('Erro ao buscar empresas');
    }
};

const updateCompany = async (req, res) => {
    const { id } = req.params;
    const { nome, cnpj, setor, email, senha, isDisabled } = req.body;

    try {
        if (!nome || !cnpj || !setor || !email) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos!' });
        }

        // Validação do CNPJ
        if (!validateCNPJ(cnpj)) {
            return res.status(400).json({ error: 'CNPJ inválido!' });
        }

        // Verificar se o CNPJ já está cadastrado em outra empresa
        const existingCompanyByCNPJ = await Company.findOne({ cnpj });
        if (existingCompanyByCNPJ && existingCompanyByCNPJ._id.toString() !== id) {
            return res.status(400).json({ error: 'CNPJ já cadastrado!' });
        }

        // Verificar se o e-mail já está cadastrado em outra empresa
        const existingCompanyByEmail = await Company.findOne({ email });
        if (existingCompanyByEmail && existingCompanyByEmail._id.toString() !== id) {
            return res.status(400).json({ error: 'Email já cadastrado!' });
        }

        // Montar os campos que serão atualizados
        const updates = {
            nome,
            cnpj,
            setor,
            email,
            isDisabled
        };

        // Atualizar a senha apenas se ela for fornecida
        if (senha && senha.trim() !== "") {  // Se o campo de senha não for vazio
            const existingCompany = await Company.findById(id);
            if (!existingCompany) {
                return res.status(404).json({ error: 'Empresa não encontrada!' });
            }

            // Verificar se a nova senha é diferente da senha atual
            const isSamePassword = await bcrypt.compare(senha, existingCompany.senha);
            if (!isSamePassword) {
                updates.senha = await bcrypt.hash(senha, 10);  // Recriptografar nova senha
            }
        }

        // Atualizar a empresa
        const company = await Company.findByIdAndUpdate(id, updates, { new: true });
        res.send(company);
    } catch (error) {
        console.error('Erro ao atualizar empresa:', error);
        res.status(500).json({ error: 'Erro ao atualizar empresa' });
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

const toggleCompanyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findById(id);
        if (!company) {
            return res.status(404).send('Empresa não encontrada');
        }
        company.isDisabled = !company.isDisabled;
        await company.save();
        res.send(company);
    } catch (error) {
        res.status(500).send('Erro ao alterar status da empresa');
    }
};

const getJobsByCompany = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { companyId } = req.params;

    try {
        const jobs = await Job.find({ company: companyId })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .exec();

        const count = await Job.countDocuments({ company: companyId });

        res.json({
            jobs,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).send('Erro ao buscar vagas');
    }
};

const getCandidatesByJob = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { jobId } = req.params;

    try {
        const applications = await JobApplication.find({ job: jobId })
            .populate('user', 'nome email additionalInfo')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .exec();

        const count = await JobApplication.countDocuments({ job: jobId });

        res.json({
            candidates: applications.map(application => application.user),
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).send('Erro ao buscar candidatos');
    }
};


module.exports = {
    getCurrentCompany,
    addCompany,
    getCompanies,
    updateCompany,
    deleteCompany,
    toggleCompanyStatus,
    getJobsByCompany,
    getCandidatesByJob
};
