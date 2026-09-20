const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { sendTemporaryPasswordEmail } = require('../utils/emailService');
const { generateTemporaryPassword } = require('../utils/passwordUtils');

const SALT_ROUNDS = 10;

const getClienteRoleId = async (client) => {
  const { rows } = await client.query(
    "SELECT id_rol FROM roles WHERE nombre_rol = 'Cliente' LIMIT 1"
  );
  return rows[0]?.id_rol;
};

const getClientes = async (req, res) => {
  const { estado } = req.query;
  const values = [];
  const filters = ["r.nombre_rol = 'Cliente'"];

  if (estado) {
    values.push(estado);
    filters.push(`u.estado = $${values.length}`);
  }

  try {
    const { rows } = await pool.query(
      `SELECT
        u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.estado,
        m.id_membresia, m.fecha_inicio, m.fecha_fin, m.estado AS estado_membresia,
        p.id_plan, p.nombre_plan
      FROM usuarios u
      INNER JOIN roles r ON r.id_rol = u.id_rol
      LEFT JOIN LATERAL (
        SELECT *
        FROM membresias mm
        WHERE mm.id_cliente = u.id_usuario
        ORDER BY (mm.estado='Activa' AND mm.fecha_inicio <= CURRENT_DATE AND mm.fecha_fin > CURRENT_DATE) DESC, mm.fecha_fin DESC, mm.id_membresia DESC
        LIMIT 1
      ) m ON true
      LEFT JOIN planes p ON p.id_plan = m.id_plan
      WHERE ${filters.join(' AND ')}
      ORDER BY u.id_usuario DESC`,
      values
    );

    return res.json(rows);
  } catch (error) {
    console.error('Error listando clientes:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getClienteById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.estado,
        m.id_membresia, m.fecha_inicio, m.fecha_fin, m.estado AS estado_membresia,
        p.id_plan, p.nombre_plan
      FROM usuarios u
      INNER JOIN roles r ON r.id_rol = u.id_rol
      LEFT JOIN LATERAL (
        SELECT *
        FROM membresias mm
        WHERE mm.id_cliente = u.id_usuario
        ORDER BY mm.fecha_fin DESC, mm.id_membresia DESC
        LIMIT 1
      ) m ON true
      LEFT JOIN planes p ON p.id_plan = m.id_plan
      WHERE u.id_usuario = $1 AND r.nombre_rol = 'Cliente'`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const createCliente = async (req, res) => {
  const { nombre, apellido, email, telefono, estado = 'Activo' } = req.body;

  if (!nombre || !apellido || !email) {
    return res.status(400).json({ message: 'Nombre, apellido y email son obligatorios.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const clienteRoleId = await getClienteRoleId(client);

    if (!clienteRoleId) {
      await client.query('ROLLBACK');
      return res.status(500).json({ message: 'Rol Cliente no existe en la base de datos.' });
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);

    const { rows } = await client.query(
      `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, telefono, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_usuario, nombre, apellido, email, telefono, estado`,
      [clienteRoleId, nombre, apellido, email, passwordHash, telefono || null, estado]
    );

    await client.query('COMMIT');

    const emailResult = await sendTemporaryPasswordEmail({
      to: email,
      nombre,
      temporaryPassword,
    });

    return res.status(201).json({
      message: emailResult.sent
        ? 'Cliente creado y correo enviado.'
        : `Cliente creado. ${emailResult.reason}`,
      cliente: rows[0],
      correoEnviado: emailResult.sent,
      correoError: emailResult.sent ? undefined : emailResult.code,
      temporaryPassword: emailResult.sent
        ? undefined
        : temporaryPassword,
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
    }

    console.error('Error creando cliente:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  } finally {
    client.release();
  }
};

const updateCliente = async (req, res) => {
  const { nombre, apellido, email, telefono, estado } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE usuarios u
      SET nombre = COALESCE($1, nombre),
        apellido = COALESCE($2, apellido),
        email = COALESCE($3, email),
        telefono = COALESCE($4, telefono),
        estado = COALESCE($5, estado),
        token_version = token_version + CASE WHEN $5 IS NOT NULL AND $5 <> estado THEN 1 ELSE 0 END
      FROM roles r
      WHERE u.id_rol = r.id_rol
        AND r.nombre_rol = 'Cliente'
        AND u.id_usuario = $6
      RETURNING u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.estado`,
      [nombre, apellido, email, telefono, estado, req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
    }

    console.error('Error actualizando cliente:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const updateClienteEstado = async (req, res) => {
  const { estado } = req.body;
  const estadosPermitidos = ['Activo', 'Inactivo', 'Moroso'];

  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ message: 'Estado invalido.' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE usuarios u
      SET estado = $1, token_version = token_version + 1
      FROM roles r
      WHERE u.id_rol = r.id_rol
        AND r.nombre_rol = 'Cliente'
        AND u.id_usuario = $2
      RETURNING u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.estado`,
      [estado, req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Error actualizando estado de cliente:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const deleteCliente = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM usuarios u
      USING roles r
      WHERE u.id_rol = r.id_rol
        AND r.nombre_rol = 'Cliente'
        AND u.id_usuario = $1`,
      [req.params.id]
    );

    if (!rowCount) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }

    return res.status(204).send();
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({ message: 'No se puede eliminar un cliente con historial asociado.' });
    }

    console.error('Error eliminando cliente:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const { registrarPago } = require('./paymentController');

const getPagos = async (req, res) => {
  const { id_cliente } = req.query;
  const values = [];
  const filters = [];

  if (id_cliente) {
    values.push(id_cliente);
    filters.push(`m.id_cliente = $${values.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  try {
    const { rows } = await pool.query(
      `SELECT
        p.*,
        c.nombre || ' ' || c.apellido AS cliente,
        rec.nombre || ' ' || rec.apellido AS recepcionista,
        pl.nombre_plan
      FROM pagos p
      INNER JOIN membresias m ON m.id_membresia = p.id_membresia
      INNER JOIN usuarios c ON c.id_usuario = m.id_cliente
      INNER JOIN usuarios rec ON rec.id_usuario = p.id_recepcionista
      INNER JOIN planes pl ON pl.id_plan = m.id_plan
      ${where}
      ORDER BY p.fecha_pago DESC`,
      values
    );

    return res.json(rows);
  } catch (error) {
    console.error('Error listando pagos:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getPlanes = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id_plan, nombre_plan, precio, duracion_dias FROM planes ORDER BY precio ASC'
    );

    return res.json(rows);
  } catch (error) {
    console.error('Error listando planes para recepcion:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  updateClienteEstado,
  deleteCliente,
  registrarPago,
  getPagos,
  getPlanes,
};
