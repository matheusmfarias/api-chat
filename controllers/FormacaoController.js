const User = require('../models/User');

exports.addFormacao = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.formacao.push(req.body);
        await user.save();
        res.status(200).send({ message: 'Formação adicionada com sucesso!' });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao adicionar formação.', error });
    }
};

exports.updateFormacao = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const formacao = user.formacao.id(req.params.formacaoId);
        if (!formacao) {
            return res.status(404).send({ message: 'Formação não encontrada.' });
        }
        Object.assign(formacao, req.body);
        await user.save();
        res.status(200).send({ message: 'Formação atualizada com sucesso!' });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao atualizar Formação.', error });
    }
};

exports.deleteFormacao = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const formacao = user.formacao.id(req.params.formacaoId);
        if (!formacao) {
            return res.status(404).send({ message: 'Formação não encontrada.' });
        }
        formacao.remove();
        await user.save();
        res.status(200).send({ message: 'Formação removida com sucesso!' });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao remover Formação.', error });
    }
};
