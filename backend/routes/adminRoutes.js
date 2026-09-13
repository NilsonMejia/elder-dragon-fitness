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
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('Administrador'));

router.get('/dashboard', getDashboardStats);
router.get('/reportes/financieros', getReportesFinancieros);

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

module.exports = router;
