const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const login = async (req, res) => {
  const { correo, password, contrasena } = req.body;
  const passwordIngresada = password || contrasena;

  if (!correo || !passwordIngresada) {
    return res.status(400).json({
      message: 'El correo y la contrasena son obligatorios.',
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no esta configurado.');
    return res.status(500).json({ message: 'Error de configuracion del servidor.' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT
        u.id,
        u.nombre,
        u.correo,
        u.password_hash,
        r.nombre AS rol
      FROM usuarios u
      INNER JOIN roles r ON r.id = u.rol_id
      WHERE u.correo = $1
      LIMIT 1`,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(
      passwordIngresada,
      usuario.password_hash
    );

    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    const token = jwt.sign(
      {
        userId: usuario.id,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.status(200).json({
      message: 'Inicio de sesion exitoso.',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  login,
};
