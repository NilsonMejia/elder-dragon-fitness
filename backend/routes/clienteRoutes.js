const express = require('express');
const { getMiPerfil, getMiRutina } = require('../controllers/clienteController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('Cliente'));

router.get('/perfil', getMiPerfil);
router.get('/rutina', getMiRutina);

module.exports = router;
