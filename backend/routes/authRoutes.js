const express = require('express');
const { login, cambiarPasswordInicial } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/cambiar-password-inicial', cambiarPasswordInicial);

router.get('/me',require('../middleware/authMiddleware').authenticateToken,(req,res)=>res.json({rol:req.user.rol,id:req.user.userId}));
module.exports=router;
