const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[0] === 'Bearer'
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado.' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no esta configurado.');
    return res.status(500).json({ message: 'Error de configuracion del servidor.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(`SELECT u.estado, u.debe_cambiar_password, u.token_version, r.nombre_rol AS rol FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE u.id_usuario=$1`, [decoded.userId]);
    const user = result.rows[0];
    if (!user || user.estado==='Inactivo' || user.debe_cambiar_password || user.token_version !== (decoded.version || 0)) return res.status(401).json({message:'Sesión revocada. Inicia sesión de nuevo.'});
    if (user.rol==='Cliente') {
      const settings = await pool.query('SELECT datos FROM configuracion WHERE id=1');
      if(settings.rows[0]?.datos.modoMantenimiento) return res.status(503).json({message:'Sistema en mantenimiento.'});
    }
    req.user = {...decoded, rol:user.rol};
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token inválido o expirado.' });
    return next(error);
  }
};

const authorizeRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        message: 'No tienes permisos para acceder a este recurso.',
      });
    }

    return next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
