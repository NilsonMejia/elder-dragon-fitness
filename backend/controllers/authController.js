const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const login = async (req, res) => {
  const { email, correo, password, contrasena } = req.body;
  
  // Soporte para diferentes nombres de variables desde el frontend
  const userEmail = email || correo;
  const passwordIngresada = password || contrasena;

  if (!userEmail || !passwordIngresada) {
    return res.status(400).json({
      message: 'El email y la contraseña son obligatorios.',
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no está configurado.');
    return res.status(500).json({ message: 'Error de configuración del servidor.' });
  }

  try {
    // 1. Buscamos al usuario y su rol en la base de datos
    const { rows } = await pool.query(
      `SELECT
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.email,
        u.password_hash,
        u.estado,
        r.nombre_rol AS rol
      FROM usuarios u
      INNER JOIN roles r ON r.id_rol = u.id_rol
      WHERE u.email = $1
      LIMIT 1`,
      [userEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const usuario = rows[0];
    let passwordValida = false;

    // =========================================================
    // 2. VALIDACIÓN DE CONTRASEÑA (Adaptada para desarrollo)
    // =========================================================
    // Si la contraseña en la BD es el dato de prueba 'hash_123', 
    // dejamos entrar al usuario si escribe '123456' en el Login
    if (usuario.password_hash === 'hash_123' && passwordIngresada === '123456') {
      passwordValida = true;
    } else {
      // Si ya es un usuario real con contraseña encriptada, usamos bcrypt
      passwordValida = await bcrypt.compare(passwordIngresada, usuario.password_hash);
    }
    // =========================================================

    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Generamos el JWT con el ID y el Rol del usuario
    const token = jwt.sign(
      {
        userId: usuario.id_usuario,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // 4. Retornamos éxito al frontend
    return res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        estado: usuario.estado,
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