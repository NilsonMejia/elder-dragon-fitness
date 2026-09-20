const express = require('express');
const validation = require('../middleware/validation');
const {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  updateClienteEstado,
  deleteCliente,
  registrarPago,
  getPagos,
  getPlanes,
} = require('../controllers/recepcionController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('Administrador', 'Recepcionista'));

router.get('/clientes', getClientes);
router.get('/clientes/:id', getClienteById);
router.post('/clientes', validation.user, createCliente);
router.put('/clientes/:id', validation.user, updateCliente);
router.patch('/clientes/:id/estado', updateClienteEstado);
router.delete('/clientes/:id', deleteCliente);

router.get('/pagos', getPagos);
router.post('/pagos', registrarPago);
router.get('/renovacion',require('../controllers/paymentController').preview);
router.get('/alertas',async(req,res)=>res.json(await require('../services/membershipService').alerts()));
router.get('/planes', getPlanes);

module.exports = router;
