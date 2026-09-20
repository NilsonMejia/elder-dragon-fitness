const express = require('express');
const validation = require('../middleware/validation');
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
router.post('/usuarios', validation.user, createUsuario);
router.put('/usuarios/:id', validation.user, updateUsuario);
router.delete('/usuarios/:id', deleteUsuario);

router.get('/planes', getPlanes);
router.get('/planes/:id', getPlanById);
router.post('/planes', validation.plan, createPlan);
router.put('/planes/:id', validation.plan, updatePlan);
router.delete('/planes/:id', deletePlan);

// ==========================================
// 2. NUEVAS RUTAS DEL CATÁLOGO DE RUTINAS
// ==========================================
router.get('/rutinas', getRutinas);
router.post('/rutinas', createRutina);
router.put('/rutinas/:id', updateRutina);
router.delete('/rutinas/:id', deleteRutina);

const settings=require('../controllers/settingsController');
router.get('/configuracion',settings.getSettings);
router.put('/configuracion',settings.saveSettings);
router.put('/password',settings.changePassword);
router.get('/alertas',async(req,res)=>res.json(await require('../services/membershipService').alerts()));
module.exports=router;