const Joi = require('joi');

const validateCompany = (req, res, next) => {
    const schema = Joi.object({
        nome: Joi.string().required(),
        cnpj: Joi.string().required().regex(/^\d{14}$/),
        setor: Joi.string().required(),
        email: Joi.string().email().required(),
        senha: Joi.string().min(6).required(),
        isDisabled: Joi.boolean(),
        logo: Joi.string()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = { validateCompany };
