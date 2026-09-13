const express = require('express');
const {
  getDashboardStats,
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getPlanes,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getReportesFinancieros,
  // 1. IMPORTAMOS LAS FUNCIONES DE RUTINAS
  getRutinas,
  createRutina,
  updateRutina,
  deleteRutina
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware de protección: Solo Administradores
router.use(authenticateToken, authorizeRoles('Administrador'));

router.get('/dashboard', getDashboardStats);
router.get('/reportes', getReportesFinancieros);

router.get('/usuarios', getUsuarios);
router.get('/usuarios/:id', getUsuarioById);
router.post('/usuarios', createUsuario);
router.put('/usuarios/:id', updateUsuario);
router.delete('/usuarios/:id', deleteUsuario);

router.get('/planes', getPlanes);
router.get('/planes/:id', getPlanById);
router.post('/planes', createPlan);
router.put('/planes/:id', updatePlan);
router.delete('/planes/:id', deletePlan);

// ==========================================
// 2. NUEVAS RUTAS DEL CATÁLOGO DE RUTINAS
// ==========================================
router.get('/rutinas', getRutinas);
router.post('/rutinas', createRutina);
router.put('/rutinas/:id', updateRutina);
router.delete('/rutinas/:id', deleteRutina);

module.exports = router;