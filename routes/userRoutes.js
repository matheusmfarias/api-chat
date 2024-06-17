const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Obter dados do usuário autenticado
router.get('/candidato', auth, (req, res) => {
    const user = req.user;
    res.json({
        nome: user.nome,
        sobrenome: user.sobrenome,
        estadoCivil: user.estadoCivil,
        cpf: user.cpf,
        nascimento: user.nascimento,
        email: user.email,
        telefoneContato: user.telefoneContato,
        telefoneRecado: user.telefoneRecado,
        endereco: user.endereco
    });
});

module.exports = router;
