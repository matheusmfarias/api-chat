const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Obter dados do usuário autenticado
router.get('/candidato', auth, (req, res) => {
    res.send(req.user);
});

module.exports = router;
