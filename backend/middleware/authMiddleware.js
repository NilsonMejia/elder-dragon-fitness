const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
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
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalido o expirado.' });
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
