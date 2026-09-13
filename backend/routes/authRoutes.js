const express = require('express');
const { login, cambiarPasswordInicial } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/cambiar-password-inicial', cambiarPasswordInicial);

module.exports = router;
