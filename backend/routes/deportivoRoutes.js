const express = require('express');
const {
  getEjercicios,
  getEjercicioById,
  createEjercicio,
  updateEjercicio,
  deleteEjercicio,
  getRutinas,
  getRutinaById,
  createRutina,
  updateRutina,
  deleteRutina,
} = require('../controllers/deportivoController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('Administrador', 'Entrenador'));

router.get('/ejercicios', getEjercicios);
router.get('/ejercicios/:id', getEjercicioById);
router.post('/ejercicios', createEjercicio);
router.put('/ejercicios/:id', updateEjercicio);
router.delete('/ejercicios/:id', deleteEjercicio);

router.get('/rutinas', getRutinas);
router.get('/rutinas/:id', getRutinaById);
router.post('/rutinas', createRutina);
router.put('/rutinas/:id', updateRutina);
router.delete('/rutinas/:id', deleteRutina);

const assignments=require('../controllers/assignmentController');
router.get('/clientes',assignments.clients);
router.get('/asignaciones',assignments.list);
router.post('/asignaciones',assignments.create);
router.patch('/asignaciones/:id/archivar',assignments.archive);
router.get('/asignaciones/:id/seguimiento',assignments.history);
router.post('/asignaciones/:id/seguimiento',assignments.progress);
module.exports = router;
