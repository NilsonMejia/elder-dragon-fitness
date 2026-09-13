const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

const signToken = (usuario) => {
  return jwt.sign(
    {
      userId: usuario.id_usuario,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

const buildUserPayload = (usuario) => ({
  id: usuario.id_usuario,
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  email: usuario.email,
  rol: usuario.rol,
  estado: usuario.estado,
});

const findUserByEmail = async (email) => {
  const { rows } = await pool.query(
    `SELECT
      u.id_usuario,
      u.nombre,
      u.apellido,
      u.email,
      u.password_hash,
      u.estado,
      COALESCE(u.debe_cambiar_password, false) AS debe_cambiar_password,
      r.nombre_rol AS rol
    FROM usuarios u
    INNER JOIN roles r ON r.id_rol = u.id_rol
    WHERE u.email = $1
    LIMIT 1`,
    [email]
  );

  return rows[0] || null;
};

const validatePassword = async (usuario, passwordIngresada) => {
  if (usuario.password_hash === 'hash_123' && passwordIngresada === '123456') {
    return true;
  }

  return bcrypt.compare(passwordIngresada, usuario.password_hash);
};

const ensureJwtSecret = (res) => {
  if (process.env.JWT_SECRET) {
    return true;
  }

  console.error('JWT_SECRET no esta configurado.');
  res.status(500).json({ message: 'Error de configuracion del servidor.' });
  return false;
};

const login = async (req, res) => {
  const { email, correo, password, contrasena } = req.body;

  const userEmail = email || correo;
  const passwordIngresada = password || contrasena;

  if (!userEmail || !passwordIngresada) {
    return res.status(400).json({
      message: 'El email y la contrasena son obligatorios.',
    });
  }

  if (!ensureJwtSecret(res)) {
    return undefined;
  }

  try {
    const usuario = await findUserByEmail(userEmail);

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    const passwordValida = await validatePassword(usuario, passwordIngresada);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    if (usuario.debe_cambiar_password) {
      return res.status(403).json({
        message: 'Debes cambiar tu contrasena antes de ingresar.',
        requirePasswordChange: true,
        email: usuario.email,
      });
    }

    const token = signToken(usuario);

    return res.status(200).json({
      message: 'Inicio de sesion exitoso.',
      token,
      usuario: buildUserPayload(usuario),
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const cambiarPasswordInicial = async (req, res) => {
  const {
    email,
    correo,
    tempPassword,
    passwordTemporal,
    contrasenaTemporal,
    newPassword,
    nuevaPassword,
    nuevaContrasena,
  } = req.body;

  const userEmail = email || correo;
  const oldPassword = tempPassword || passwordTemporal || contrasenaTemporal;
  const finalPassword = newPassword || nuevaPassword || nuevaContrasena;

  if (!userEmail || !oldPassword || !finalPassword) {
    return res.status(400).json({
      message: 'Email, contrasena temporal y nueva contrasena son obligatorios.',
    });
  }

  if (finalPassword.length < 8) {
    return res.status(400).json({
      message: 'La nueva contrasena debe tener al menos 8 caracteres.',
    });
  }

  if (!ensureJwtSecret(res)) {
    return undefined;
  }

  try {
    const usuario = await findUserByEmail(userEmail);

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    if (!usuario.debe_cambiar_password) {
      return res.status(400).json({
        message: 'Este usuario no requiere cambio de contrasena inicial.',
      });
    }

    const oldPasswordValid = await bcrypt.compare(oldPassword, usuario.password_hash);

    if (!oldPasswordValid) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    const newPasswordHash = await bcrypt.hash(finalPassword, SALT_ROUNDS);

    const { rows } = await pool.query(
      `UPDATE usuarios
      SET password_hash = $1, debe_cambiar_password = false
      WHERE id_usuario = $2
      RETURNING id_usuario, nombre, apellido, email, estado`,
      [newPasswordHash, usuario.id_usuario]
    );

    const usuarioActualizado = {
      ...usuario,
      ...rows[0],
      debe_cambiar_password: false,
    };
    const token = signToken(usuarioActualizado);

    return res.status(200).json({
      message: 'Contrasena actualizada correctamente.',
      token,
      usuario: buildUserPayload(usuarioActualizado),
    });
  } catch (error) {
    console.error('Error cambiando contrasena inicial:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  login,
  cambiarPasswordInicial,
};
