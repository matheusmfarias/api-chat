const User = require('../models/User');

exports.addExperience = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.experiences.push(req.body);
        await user.save();
        res.status(200).send({ message: 'Experiência adicionada com sucesso!' });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao adicionar experiência.', error });
    }
};

exports.updateExperience = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const experience = user.experiences.id(req.params.expId);
        if (!experience) {
            return res.status(404).send({ message: 'Experiência não encontrada.' });
        }
        Object.assign(experience, req.body);
        await user.save();
        res.status(200).send({ message: 'Experiência atualizada com sucesso!' });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao atualizar experiência.', error });
    }
};

exports.deleteExperience = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const experience = user.experiences.id(req.params.expId);
        if (!experience) {
            return res.status(404).send({ message: 'Experiência não encontrada.' });
        }
        experience.remove();
        await user.save();
        res.status(200).send({ message: 'Experiência removida com sucesso!' });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao remover experiência.', error });
    }
};
