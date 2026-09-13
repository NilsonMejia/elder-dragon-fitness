const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { sendTemporaryPasswordEmail } = require('../utils/emailService');
const { generateTemporaryPassword } = require('../utils/passwordUtils');

const SALT_ROUNDS = 10;

const resolveRoleId = async (client, { id_rol, rol }) => {
  if (id_rol) {
    return id_rol;
  }

  if (!rol) {
    return null;
  }

  const { rows } = await client.query(
    'SELECT id_rol FROM roles WHERE nombre_rol = $1 LIMIT 1',
    [rol]
  );

  return rows[0]?.id_rol || null;
};

// =========================================================================
// DASHBOARD CORREGIDO (Sin duplicados y adaptado para el gráfico)
// =========================================================================
const getDashboardStats = async (req, res) => {
  try {
    const [
      usuarios,
      clientes,
      membresias,
      ingresosMes,
      pagosHoy,
      rutinas,
      grafico // Consulta para el gráfico de Recharts
    ] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM usuarios'),
      pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE r.nombre_rol = 'Cliente')::int AS total,
          COUNT(*) FILTER (WHERE r.nombre_rol = 'Cliente' AND u.estado = 'Activo')::int AS activos,
          COUNT(*) FILTER (WHERE r.nombre_rol = 'Cliente' AND u.estado = 'Moroso')::int AS morosos,
          COUNT(*) FILTER (WHERE r.nombre_rol = 'Cliente' AND u.estado = 'Inactivo')::int AS inactivos
        FROM usuarios u
        INNER JOIN roles r ON r.id_rol = u.id_rol`
      ),
      pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE estado = 'Activa')::int AS activas,
          COUNT(*) FILTER (WHERE estado = 'Morosa')::int AS morosas,
          COUNT(*) FILTER (WHERE fecha_fin < CURRENT_DATE)::int AS vencidas
        FROM membresias`
      ),
      pool.query(
        `SELECT COALESCE(SUM(monto), 0)::numeric AS total
        FROM pagos
        WHERE fecha_pago >= date_trunc('month', CURRENT_DATE)`
      ),
      pool.query(
        `SELECT COALESCE(SUM(monto), 0)::numeric AS total, COUNT(*)::int AS cantidad
        FROM pagos
        WHERE fecha_pago::date = CURRENT_DATE`
      ),
      pool.query('SELECT COUNT(*)::int AS total FROM rutinas'),
      pool.query(
        `SELECT 
          to_char(fecha_pago, 'Mon') AS mes,
          COALESCE(SUM(monto), 0)::numeric AS ingresos
        FROM pagos
        WHERE fecha_pago >= date_trunc('month', CURRENT_DATE) - INTERVAL '4 months'
        GROUP BY to_char(fecha_pago, 'Mon'), date_trunc('month', fecha_pago)
        ORDER BY date_trunc('month', fecha_pago) ASC`
      )
    ]);

    return res.json({
      stats: {
        activos: clientes.rows[0].activos,
        morosos: clientes.rows[0].morosos,
        ingresos: Number(ingresosMes.rows[0].total),
        rutinas: rutinas.rows[0].total
      },
      chart: grafico.rows.length > 0 ? grafico.rows : [{ mes: 'Actual', ingresos: Number(ingresosMes.rows[0].total) }],
      detalles_extra: {
        usuarios: usuarios.rows[0],
        membresias: membresias.rows[0],
        pagosHoy: {
          total: Number(pagosHoy.rows[0].total),
          cantidad: pagosHoy.rows[0].cantidad,
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
// =========================================================================

const getUsuarios = async (req, res) => {
  const { rol, estado } = req.query;
  const values = [];
  const filters = [];

  if (rol) {
    values.push(rol);
    filters.push(`r.nombre_rol = $${values.length}`);
  }

  if (estado) {
    values.push(estado);
    filters.push(`u.estado = $${values.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  try {
    const { rows } = await pool.query(
      `SELECT
        u.id_usuario, u.id_rol, r.nombre_rol, u.nombre, u.apellido,
        u.email, u.telefono, u.estado
      FROM usuarios u
      INNER JOIN roles r ON r.id_rol = u.id_rol
      ${where}
      ORDER BY u.id_usuario DESC`,
      values
    );

    return res.json(rows);
  } catch (error) {
    console.error('Error listando usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getUsuarioById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        u.id_usuario, u.id_rol, r.nombre_rol, u.nombre, u.apellido,
        u.email, u.telefono, u.estado
      FROM usuarios u
      INNER JOIN roles r ON r.id_rol = u.id_rol
      WHERE u.id_usuario = $1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const createUsuario = async (req, res) => {
  const { nombre, apellido, email, telefono, estado = 'Activo', id_rol, rol } = req.body;

  if (!nombre || !apellido || !email) {
    return res.status(400).json({ message: 'Nombre, apellido y email son obligatorios.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const roleId = await resolveRoleId(client, { id_rol, rol });

    if (!roleId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Rol invalido o no proporcionado.' });
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);

    const { rows } = await client.query(
      `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, telefono, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_usuario, id_rol, nombre, apellido, email, telefono, estado`,
      [roleId, nombre, apellido, email, passwordHash, telefono || null, estado]
    );

    await client.query('COMMIT');

    const emailResult = await sendTemporaryPasswordEmail({
      to: email,
      nombre,
      temporaryPassword,
    });

    return res.status(201).json({
      message: emailResult.sent
        ? 'Usuario creado y correo enviado.'
        : 'Usuario creado. Configura SMTP para enviar correos automaticamente.',
      usuario: rows[0],
      correoEnviado: emailResult.sent,
      temporaryPassword: emailResult.sent || process.env.NODE_ENV === 'production'
        ? undefined
        : temporaryPassword,
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
    }

    console.error('Error creando usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  } finally {
    client.release();
  }
};

const updateUsuario = async (req, res) => {
  const { nombre, apellido, email, telefono, estado, id_rol, rol, password } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const current = await client.query(
      'SELECT * FROM usuarios WHERE id_usuario = $1',
      [req.params.id]
    );

    if (!current.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const roleId = await resolveRoleId(client, { id_rol, rol });
    const passwordHash = password
      ? await bcrypt.hash(password, SALT_ROUNDS)
      : current.rows[0].password_hash;

    const { rows } = await client.query(
      `UPDATE usuarios
      SET id_rol = $1, nombre = $2, apellido = $3, email = $4,
        password_hash = $5, telefono = $6, estado = $7
      WHERE id_usuario = $8
      RETURNING id_usuario, id_rol, nombre, apellido, email, telefono, estado`,
      [
        roleId || current.rows[0].id_rol,
        nombre ?? current.rows[0].nombre,
        apellido ?? current.rows[0].apellido,
        email ?? current.rows[0].email,
        passwordHash,
        telefono ?? current.rows[0].telefono,
        estado ?? current.rows[0].estado,
        req.params.id,
      ]
    );

    await client.query('COMMIT');
    return res.json(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
    }

    console.error('Error actualizando usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  } finally {
    client.release();
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM usuarios WHERE id_usuario = $1',
      [req.params.id]
    );

    if (!rowCount) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    return res.status(204).send();
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        message: 'No se puede eliminar un usuario con membresias, pagos o rutinas asociadas.',
      });
    }

    console.error('Error eliminando usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getPlanes = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM planes ORDER BY id_plan ASC');
    return res.json(rows);
  } catch (error) {
    console.error('Error listando planes:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getPlanById = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM planes WHERE id_plan = $1', [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Plan no encontrado.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo plan:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const createPlan = async (req, res) => {
  const { nombre_plan, precio, duracion_dias } = req.body;

  if (!nombre_plan || precio == null || !duracion_dias) {
    return res.status(400).json({ message: 'Nombre, precio y duracion son obligatorios.' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO planes (nombre_plan, precio, duracion_dias)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [nombre_plan, precio, duracion_dias]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creando plan:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const updatePlan = async (req, res) => {
  const { nombre_plan, precio, duracion_dias } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE planes
      SET nombre_plan = COALESCE($1, nombre_plan),
        precio = COALESCE($2, precio),
        duracion_dias = COALESCE($3, duracion_dias)
      WHERE id_plan = $4
      RETURNING *`,
      [nombre_plan, precio, duracion_dias, req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Plan no encontrado.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Error actualizando plan:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const deletePlan = async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM planes WHERE id_plan = $1', [req.params.id]);

    if (!rowCount) {
      return res.status(404).json({ message: 'Plan no encontrado.' });
    }

    return res.status(204).send();
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({ message: 'No se puede eliminar un plan con membresias asociadas.' });
    }

    console.error('Error eliminando plan:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getReportesFinancieros = async (req, res) => {
  const { desde, hasta } = req.query;
  const values = [];
  const filters = [];

  if (desde) {
    values.push(desde);
    filters.push(`p.fecha_pago::date >= $${values.length}`);
  }

  if (hasta) {
    values.push(hasta);
    filters.push(`p.fecha_pago::date <= $${values.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  try {
    const [resumen, pagos] = await Promise.all([
      pool.query(
        `SELECT
          COALESCE(SUM(p.monto), 0)::numeric AS total_ingresos,
          COUNT(p.id_pago)::int AS cantidad_pagos,
          COALESCE(AVG(p.monto), 0)::numeric AS ticket_promedio
        FROM pagos p
        ${where}`,
        values
      ),
      pool.query(
        `SELECT
          p.id_pago, p.monto, p.fecha_pago, p.metodo_pago, p.num_factura_electronica,
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
      ),
    ]);

    return res.json({
      resumen: {
        total_ingresos: Number(resumen.rows[0].total_ingresos),
        cantidad_pagos: resumen.rows[0].cantidad_pagos,
        ticket_promedio: Number(resumen.rows[0].ticket_promedio),
      },
      pagos: pagos.rows,
    });
  } catch (error) {
    console.error('Error generando reportes:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  getDashboardStats,
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getPlanes,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getReportesFinancieros,
};