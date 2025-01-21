const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { sendChangeEmail } = require('../services/emailChangeEmailService');
const { createToken } = require('../services/tokenService');
const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');

const updateProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        // Verifique se o usuário já tem uma imagem de perfil
        if (user.profilePicture) {
            const oldPath = path.join(__dirname, '..', 'uploads', path.basename(user.profilePicture));
            // Verifica se o arquivo existe antes de tentar remover
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, err => {
                    if (err) console.error('Erro ao remover a foto de perfil antiga:', err);
                });
            }
        }

        // Atualiza o nome da nova imagem de perfil
        user.profilePicture = `/uploads/${req.file.filename}`;
        await user.save();

        res.status(200).send({ profilePicture: user.profilePicture });
    } catch (error) {
        console.error('Erro ao atualizar a foto de perfil:', error);
        res.status(500).send('Erro ao atualizar a foto de perfil');
    }
};

const updateCandidato = async (req, res) => {
    try {
        let user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        const { cnh, cnhTypes } = req.body;

        // Certifica que cnhTypes é um array (se não for, converte)
        const cnhTypesArray = Array.isArray(cnhTypes) ? cnhTypes : (cnhTypes ? cnhTypes.split(',') : []);

        // Verifica se CNH é true e não há tipos de CNH selecionados
        if (cnh === 'true' && (!cnhTypesArray || cnhTypesArray.length === 0)) {
            return res.status(400).send('Você deve selecionar pelo menos uma modalidade de CNH.');
        }

        // Se o usuário não tem CNH, limpa o campo cnhTypes
        if (cnh === 'false') {
            user.additionalInfo.cnhTypes = [];
        } else {
            user.additionalInfo.cnhTypes = cnhTypesArray;
        }

        // Atualiza os campos do usuário
        user.nome = req.body.nome || user.nome;
        user.sobrenome = req.body.sobrenome || user.sobrenome;
        user.nascimento = req.body.nascimento || user.nascimento;

        // Atualiza os dados adicionais do usuário
        user.additionalInfo = {
            maritalStatus: req.body.maritalStatus || user.additionalInfo.maritalStatus,
            contactPhone: req.body.contactPhone || user.additionalInfo.contactPhone,
            backupPhone: req.body.backupPhone || user.additionalInfo.backupPhone,
            rg: req.body.rg || user.additionalInfo.rg,
            cnh: cnh === 'true' || cnh === true, // Verifica se cnh é 'true' ou true e salva como booleano
            cnhTypes: cnhTypesArray
        };

        // Atualiza o endereço do usuário
        user.address = {
            street: req.body.street || user.address.street,
            number: req.body.number || user.address.number,
            district: req.body.district || user.address.district,
            city: req.body.city || user.address.city
        };

        // Atualiza a foto de perfil se uma nova imagem foi enviada
        if (req.file) {
            // Remove a foto de perfil antiga se existir
            if (user.profilePicture) {
                const oldPath = path.join(__dirname, '..', user.profilePicture);
                fs.unlink(oldPath, (err) => {
                    if (err) console.error('Erro ao remover a foto de perfil antiga:', err);
                });
            }

            // Define o novo caminho da foto de perfil
            user.profilePicture = `/uploads/${req.file.filename}`;
        }

        // Salva o usuário com as novas informações
        await user.save();

        res.status(200).send('Dados atualizados com sucesso');
    } catch (error) {
        console.error('Erro ao atualizar os dados do usuário:', error);
        res.status(500).send('Erro ao atualizar os dados do usuário');
    }
};

const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        user.address = req.body;
        await user.save();

        res.status(200).send('Endereço atualizado com sucesso');
    } catch (error) {
        res.status(400).send('Erro ao atualizar endereço');
    }
};

const updateAdditionalInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        const { cnh, cnhTypes } = req.body;

        // Se cnh é true e não há tipos de CNH selecionados
        if (cnh === true && (!cnhTypes || cnhTypes.length === 0)) {
            return res.status(400).send('Você deve selecionar pelo menos uma modalidade de CNH.');
        }

        // Se o usuário não tem CNH, limpar o campo cnhTypes
        if (cnh === false) {
            req.body.cnhTypes = [];
        }

        // Atualiza os dados adicionais do usuário
        user.additionalInfo = {
            ...user.additionalInfo,
            ...req.body
        };

        await user.save();
        res.status(200).send('Informações adicionais atualizadas com sucesso');
    } catch (error) {
        res.status(400).send('Erro ao atualizar informações adicionais');
    }
};

const completeSetup = async (req, res) => {
    try {
        const user = req.user;
        user.profileCompleted = true;
        await user.save();
        res.status(200).send('Profile setup completed successfully.');
    } catch (error) {
        res.status(500).send('Error completing profile setup.');
    }
};

const checkAvailability = async (req, res) => {
    const { email, cpf } = req.body;

    try {
        const emailExists = await User.findOne({ email });
        const cpfExists = await User.findOne({ cpf });

        res.status(200).json({ emailExists: !!emailExists, cpfExists: !!cpfExists });
    } catch (error) {
        res.status(500).send('Erro ao verificar disponibilidade.');
    }
};

const getCandidato = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        res.send(user);
    } catch (error) {
        console.error('Erro ao buscar os dados do usuário', error);
        res.status(500).send('Erro ao buscar os dados do usuário');
    }
};

const requestEmailChange = async (req, res) => {
    const { email } = req.body;
    try {
        const user = req.user;
        const emailVerificationToken = createToken();
        user.emailVerificationToken = emailVerificationToken;
        user.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
        await user.save();

        // Passa o nome do usuário ao chamar a função
        sendChangeEmail(email, user.nome, emailVerificationToken);

        res.status(200).send('Um token de verificação foi enviado para o novo e-mail.');
    } catch (error) {
        console.error('Erro ao solicitar a alteração de e-mail:', error);
        res.status(500).send('Erro ao solicitar a alteração de e-mail.');
    }
};

const verifyEmailToken = async (req, res) => {
    const { email, verificationToken } = req.body;
    try {
        const user = await User.findOne({
            _id: req.user._id,
            emailVerificationToken: verificationToken,
            tokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send('Token inválido ou expirado.');
        }

        user.email = email;
        user.emailVerificationToken = undefined;
        user.tokenExpiry = undefined;
        await user.save();

        res.status(200).send('E-mail verificado com sucesso!');
    } catch (error) {
        console.error('Erro ao verificar o token:', error);
        res.status(500).send('Erro ao verificar o token.');
    }
};

const resendEmailToken = async (req, res) => {
    const { email } = req.body;
    try {
        const user = req.user;
        const emailVerificationToken = createToken();
        user.emailVerificationToken = emailVerificationToken;
        user.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
        await user.save();

        sendChangeEmail(email, user.nome, emailVerificationToken);

        res.status(200).send('Token reenviado com sucesso!');
    } catch (error) {
        console.error('Erro ao reenviar o token de e-mail:', error);
        res.status(500).send('Erro ao reenviar o token de e-mail.');
    }
};

// Adicionar uma experiência
const addExperience = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        if (!user.experiences) {
            user.experiences = [];
        }

        user.experiences.push(req.body);
        await user.save();
        res.status(200).send({ message: 'Experiência adicionada com sucesso!' });
    } catch (error) {
        console.error('Erro ao adicionar experiência:', error);
        res.status(500).send('Erro ao adicionar experiência');
    }
};

// Atualizar uma experiência
const updateExperience = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        const experience = user.experiences.id(req.params.expId);
        if (!experience) return res.status(404).send('Experiência não encontrada');

        Object.assign(experience, req.body);
        await user.save();
        res.status(200).send({ message: 'Experiência atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar experiência:', error);
        res.status(500).send('Erro ao atualizar experiência');
    }
};

// Excluir uma experiência
const deleteExperience = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { experiences: { _id: req.params.expId } } },
            { new: true }
        );
        res.status(200).send({ message: 'Experiência removida com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover experiência:', error);
        res.status(500).send('Erro ao remover experiência');
    }
};

// Buscar todas as experiências do usuário
const getExperiences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('experiences');
        if (!user) return res.status(404).send('Usuário não encontrado');
        res.status(200).send(user.experiences);
    } catch (error) {
        console.error('Erro ao buscar experiências:', error);
        res.status(500).send('Erro ao buscar experiências');
    }
};

// Função para obter uma experiência específica pelo ID
const getExperienceById = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        const experience = user.experiences.id(req.params.expId);
        if (!experience) return res.status(404).send('Experiência não encontrada');

        res.status(200).json(experience);
    } catch (error) {
        console.error('Erro ao buscar a experiência:', error);
        res.status(500).send('Erro ao buscar a experiência');
    }
};

// Adicionar uma experiência
const addFormacao = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        if (!user.formacao) {
            user.formacao = [];
        }

        user.formacao.push(req.body);
        await user.save();
        res.status(200).send({ message: 'Formação adicionada com sucesso!' });
    } catch (error) {
        console.error('Erro ao adicionar Formação:', error);
        res.status(500).send('Erro ao adicionar Formação');
    }
};

// Atualizar uma experiência
const updateFormacao = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        const formacao = user.formacao.id(req.params.formacaoId);
        if (!formacao) return res.status(404).send('Formação não encontrada');

        Object.assign(formacao, req.body);
        await user.save();
        res.status(200).send({ message: 'Formação atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar Formação:', error);
        res.status(500).send('Erro ao atualizar Formação');
    }
};

// Excluir uma experiência
const deleteFormacao = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { formacao: { _id: req.params.formacaoId } } },
            { new: true }
        );
        res.status(200).send({ message: 'Formação removida com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover Formação:', error);
        res.status(500).send('Erro ao remover Formação');
    }
};

// Buscar todas as experiências do usuário
const getFormacao = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('formacao');
        if (!user) return res.status(404).send('Usuário não encontrado');
        res.status(200).send(user.formacao);
    } catch (error) {
        console.error('Erro ao buscar Formação:', error);
        res.status(500).send('Erro ao buscar Formação');
    }
};

// Função para obter uma experiência específica pelo ID
const getFormacaoById = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        const formacao = user.formacao.id(req.params.formacaoId);
        if (!formacao) return res.status(404).send('Formação não encontrada');

        res.status(200).json(formacao);
    } catch (error) {
        console.error('Erro ao buscar a formação:', error);
        res.status(500).send('Erro ao buscar a formação');
    }
};

// Buscar todas as informações de um usuário
const getInformacoes = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('cursos habilidadesProfissionais habilidadesComportamentais objetivos');
        if (!user) return res.status(404).send('Usuário não encontrado');
        res.status(200).send(user);
    } catch (error) {
        console.error('Erro ao buscar informações:', error);
        res.status(500).send('Erro ao buscar informações');
    }
};

// Adicionar curso
const addCurso = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        user.cursos.push(req.body.curso);
        await user.save();
        res.status(200).send('Curso adicionado com sucesso');
    } catch (error) {
        console.error('Erro ao adicionar curso:', error);
        res.status(500).send('Erro ao adicionar curso');
    }
};

// Remover curso
const removeCurso = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { cursos: req.body.curso } }
        );
        res.status(200).send('Curso removido com sucesso');
    } catch (error) {
        console.error('Erro ao remover curso:', error);
        res.status(500).send('Erro ao remover curso');
    }
};

// Adicionar habilidade profissional
const addHabilidadeProfissional = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        user.habilidadesProfissionais.push(req.body.habilidadeProfissional);
        await user.save();
        res.status(200).send('Habilidade profissional adicionada com sucesso');
    } catch (error) {
        console.error('Erro ao adicionar habilidade profissional:', error);
        res.status(500).send('Erro ao adicionar habilidade profissional');
    }
};

// Remover habilidade profissional
const removeHabilidadeProfissional = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { habilidadesProfissionais: req.body.habilidadeProfissional } }
        );
        res.status(200).send('Habilidade profissional removida com sucesso');
    } catch (error) {
        console.error('Erro ao remover habilidade profissional:', error);
        res.status(500).send('Erro ao remover habilidade profissional');
    }
};

// Adicionar habilidade comportamental
const addHabilidadeComportamental = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        user.habilidadesComportamentais.push(req.body.habilidadeComportamental);
        await user.save();
        res.status(200).send('Habilidade comportamental adicionada com sucesso');
    } catch (error) {
        console.error('Erro ao adicionar habilidade comportamental:', error);
        res.status(500).send('Erro ao adicionar habilidade comportamental');
    }
};

// Remover habilidade comportamental
const removeHabilidadeComportamental = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { habilidadesComportamentais: req.body.habilidadeComportamental } }
        );
        res.status(200).send('Habilidade comportamental removida com sucesso');
    } catch (error) {
        console.error('Erro ao remover habilidade comportamental:', error);
        res.status(500).send('Erro ao remover habilidade comportamental');
    }
};

// Adicionar objetivo
const addObjetivo = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('Usuário não encontrado');

        user.objetivos.push(req.body.objetivo);
        await user.save();
        res.status(200).send('Objetivo adicionado com sucesso');
    } catch (error) {
        console.error('Erro ao adicionar objetivo:', error);
        res.status(500).send('Erro ao adicionar objetivo');
    }
};

// Remover objetivo
const removeObjetivo = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { objetivos: req.body.objetivo } }
        );
        res.status(200).send('Objetivo removido com sucesso');
    } catch (error) {
        console.error('Erro ao remover objetivo:', error);
        res.status(500).send('Erro ao remover objetivo');
    }
};

const getCandidatos = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {};

    if (search) {
        const searchRegex = new RegExp(search, 'i'); // 'i' para case insensitive

        query.$or = [
            // Campos principais
            { nome: searchRegex },
            { sobrenome: searchRegex },
            { email: searchRegex },

            // Subdocumentos de experiência
            { 'experiences.empresa': searchRegex },
            { 'experiences.funcao': searchRegex },
            { 'experiences.atividades': searchRegex },

            // Subdocumentos de formação
            { 'formacao.instituicao': searchRegex },
            { 'formacao.curso': searchRegex },
            { 'formacao.escolaridade': searchRegex },
            { 'formacao.grau': searchRegex },
            { 'formacao.situacao': searchRegex },

            // Arrays simples
            { cursos: searchRegex },
            { habilidadesProfissionais: searchRegex },
            { habilidadesComportamentais: searchRegex },
            { objetivos: searchRegex }
        ];
    }

    // Data limite de 6 meses atrás
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    try {
        const candidatos = await User.find(query)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .exec();
        const count = await User.countDocuments(query);

        // Adiciona o campo isInactive aos candidatos que não acessaram há mais de 6 meses
        const candidatosWithStatus = candidatos.map((candidato) => ({
            ...candidato.toObject(),
            isInactive: candidato.lastAccess ? new Date(candidato.lastAccess) < sixMonthsAgo : true
        }));

        res.json({
            candidates: candidatosWithStatus,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).send('Erro ao buscar candidatos');
    }
};

const getCandidatoById = async (req, res) => {
    try {
        const user = await User.findById(req.params.candidatoId);
        if (!user) return res.status(404).send('Usuário não encontrado');
        res.send(user);
    } catch (error) {
        console.error('Erro ao buscar os dados do usuário', error);
        res.status(500).send('Erro ao buscar os dados do usuário');
    }
};

const getUserApplications = async (req, res) => {
    try {
        const userId = req.user._id; // ID do usuário autenticado
        const {
            searchTerm,
            state,
            city,
            modality,
            type,
            pcd,
            status,
            page = 1,
            limit = 9
        } = req.query;

        const filters = {};

        // Filtrar por título da vaga e combinar com outros campos
        if (searchTerm) {
            filters.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { location: { $regex: searchTerm, $options: 'i' } },
                { modality: { $regex: searchTerm, $options: 'i' } },
                { type: { $regex: searchTerm, $options: 'i' } }
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
        if (modality) {
            const modalities = Array.isArray(modality) ? modality : [modality];
            filters.modality = { $in: modalities };
        }

        if (type) {
            const types = Array.isArray(type) ? type : [type];
            filters.type = { $in: types };
        }

        if (pcd !== undefined) {
            filters.pcd = pcd === 'true';
        }

        if (status !== undefined) {
            filters.status = status === 'true';
        }

        const skip = (Number(page) - 1) * Number(limit);

        // Consultar candidaturas do usuário com base nos filtros de vaga
        const applicationsQuery = JobApplication.find({ user: userId })
            .populate({
                path: 'job',
                match: filters,
                select: 'title location modality type salary pcd identifyCompany status closingDate',
                populate: {
                    path: 'company',
                    select: 'nome'
                }
            })
            .sort({ submissionDate: -1 });

        // Executar a consulta para obter todas as candidaturas que correspondem aos filtros
        const allApplications = await applicationsQuery;
        const filteredApplications = allApplications.filter((application) => application.job !== null);

        // Aplicar paginação aos dados filtrados
        const paginatedApplications = filteredApplications.slice(skip, skip + Number(limit));

        res.status(200).json({
            applications: paginatedApplications, // Dados paginados
            totalApplications: filteredApplications.length, // Total de candidaturas após filtros
            totalPages: Math.ceil(filteredApplications.length / Number(limit)),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error('Erro ao buscar candidaturas do usuário:', error.message, error.stack);
        res.status(500).json({ error: 'Erro ao buscar candidaturas do usuário. Tente novamente mais tarde.' });
    }
};

const getUserApplicationsById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { applicationId } = req.params;

        const application = await JobApplication.findOne({ _id: applicationId, user: userId })
            .populate({
                path: 'job',
                select: 'title location modality type description responsabilities qualifications additionalInfo requirements offers pcd salary identifyCompany',
                populate: {
                    path: 'company',
                    select: 'nome'
                }
            });

        if (!application) {
            return res.status(404).json({ error: 'Aplicação não encontrada ou você não tem acesso a ela.' });
        }

        res.status(200).json(application);
    } catch (error) {
        console.error('Erro ao buscar detalhes da aplicação:', error.message, error.stack);
        res.status(500).json({ error: 'Erro ao buscar detalhes da aplicação. Tente novamente mais tarde.' });
    }
};

module.exports = {
    updateProfilePicture,
    updateCandidato,
    updateAddress,
    updateAdditionalInfo,
    completeSetup,
    checkAvailability,
    getCandidato,
    requestEmailChange,
    verifyEmailToken,
    resendEmailToken,
    addExperience,
    updateExperience,
    deleteExperience,
    getExperiences,
    getExperienceById,
    addFormacao,
    updateFormacao,
    deleteFormacao,
    getFormacao,
    getFormacaoById,
    getInformacoes,
    addCurso,
    removeCurso,
    addHabilidadeProfissional,
    removeHabilidadeProfissional,
    addHabilidadeComportamental,
    removeHabilidadeComportamental,
    addObjetivo,
    removeObjetivo,
    getCandidatos,
    getCandidatoById,
    getUserApplications,
    getUserApplicationsById
};
