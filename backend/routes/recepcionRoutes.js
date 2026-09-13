const express = require('express');
const {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  updateClienteEstado,
  deleteCliente,
  registrarPago,
  getPagos,
} = require('../controllers/recepcionController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('Administrador', 'Recepcionista'));

router.get('/clientes', getClientes);
router.get('/clientes/:id', getClienteById);
router.post('/clientes', createCliente);
router.put('/clientes/:id', updateCliente);
router.patch('/clientes/:id/estado', updateClienteEstado);
router.delete('/clientes/:id', deleteCliente);

router.get('/pagos', getPagos);
router.post('/pagos', registrarPago);

module.exports = router;
