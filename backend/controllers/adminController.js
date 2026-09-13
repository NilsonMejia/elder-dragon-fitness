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
const getDashboardStats = async (req, res) => {
  try {
    const [
      clientes,
      ingresosMes,
      rutinas,
      graficoIngresos,
      graficoPlanes, 
      graficoMembresias,
      actividad,     
      topClientesDB,
      // ================= NUEVAS CONSULTAS =================
      nuevosMesDB,
      cancelacionesDB,
      asistenciaProxyDB,
      ocupacionDB
    ] = await Promise.all([
      // 0. Clientes Activos/Morosos
      pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE r.nombre_rol = 'Cliente' AND u.estado = 'Activo')::int AS activos,
          COUNT(*) FILTER (WHERE r.nombre_rol = 'Cliente' AND u.estado = 'Moroso')::int AS morosos
        FROM usuarios u
        INNER JOIN roles r ON r.id_rol = u.id_rol`
      ),
      // 1. Ingresos
      pool.query(
        `SELECT COALESCE(SUM(monto), 0)::numeric AS total
        FROM pagos
        WHERE fecha_pago >= date_trunc('month', CURRENT_DATE)`
      ),
      // 2. Rutinas
      pool.query('SELECT COUNT(*)::int AS total FROM rutinas'),
      
      // 3. Gráfico de Ingresos
      pool.query(
        `SELECT to_char(fecha_pago, 'Mon') AS mes, COALESCE(SUM(monto), 0)::numeric AS ingresos
        FROM pagos 
        WHERE fecha_pago >= date_trunc('month', CURRENT_DATE) - INTERVAL '4 months'
        GROUP BY to_char(fecha_pago, 'Mon'), date_trunc('month', fecha_pago) 
        ORDER BY date_trunc('month', fecha_pago) ASC`
      ),
      
      // 4. Gráfico de Planes
      pool.query(
        `SELECT pl.nombre_plan AS name, COUNT(m.id_membresia)::int AS value
        FROM membresias m
        INNER JOIN planes pl ON m.id_plan = pl.id_plan
        WHERE m.estado = 'Activa'
        GROUP BY pl.nombre_plan`
      ),
      
      // 5. Gráfico de Membresías
      pool.query(
        `SELECT 
          to_char(fecha_inicio, 'Mon') AS mes,
          COUNT(*) FILTER (WHERE estado = 'Activa')::int AS activos,
          COUNT(*) FILTER (WHERE estado = 'Morosa')::int AS morosos
        FROM membresias
        WHERE fecha_inicio >= date_trunc('month', CURRENT_DATE) - INTERVAL '4 months'
        GROUP BY to_char(fecha_inicio, 'Mon'), date_trunc('month', fecha_inicio)
        ORDER BY date_trunc('month', fecha_inicio) ASC`
      ),

      // 6. Actividad Reciente
      pool.query(
        `SELECT 
          p.id_pago AS id, 
          'pago' AS tipo, 
          'Pago de $' || p.monto || ' por ' || u.nombre AS texto, 
          to_char(p.fecha_pago, 'DD Mon YYYY HH12:MI AM') AS hora
        FROM pagos p
        INNER JOIN membresias m ON p.id_membresia = m.id_membresia
        INNER JOIN usuarios u ON m.id_cliente = u.id_usuario
        ORDER BY p.fecha_pago DESC
        LIMIT 5`
      ),

      // 7. Top Clientes
      pool.query(
        `SELECT 
          u.id_usuario AS id, 
          u.nombre || ' ' || u.apellido AS nombre, 
          pl.nombre_plan AS plan, 
          20 AS asistencia, 
          COALESCE(SUM(p.monto), 0)::numeric AS gasto
        FROM usuarios u
        INNER JOIN membresias m ON u.id_usuario = m.id_cliente
        INNER JOIN planes pl ON m.id_plan = pl.id_plan
        INNER JOIN pagos p ON m.id_membresia = p.id_membresia
        WHERE u.id_rol = 4
        GROUP BY u.id_usuario, u.nombre, u.apellido, pl.nombre_plan
        ORDER BY gasto DESC
        LIMIT 5`
      ),

      // ================= LÓGICA DE NUEVOS KPIs =================
      
      // 8. Nuevos este mes (Membresías que iniciaron este mes)
      pool.query(
        `SELECT COUNT(*)::int AS total FROM membresias 
         WHERE fecha_inicio >= date_trunc('month', CURRENT_DATE)`
      ),

      // 9. Cancelaciones (Membresías vencidas o marcadas como inactivas)
      pool.query(
        `SELECT COUNT(*)::int AS total FROM membresias 
         WHERE fecha_fin < CURRENT_DATE OR estado = 'Inactiva'`
      ),

      // 10. Asistencia Hoy (Proxy: Personas que interactuaron pagando hoy)
      pool.query(
        `SELECT COUNT(*)::int AS total FROM pagos 
         WHERE fecha_pago::date = CURRENT_DATE`
      ),

      // 11. Ocupación (Cálculo del % basado en un máximo de 200 personas)
      pool.query(
        `SELECT LEAST(ROUND((COUNT(*)::numeric / 200.0) * 100), 100)::int AS porcentaje 
         FROM usuarios 
         WHERE estado = 'Activo' AND id_rol = 4`
      )
    ]);

    const colores = ['#00d4ff', '#00ff88', '#bb00ff', '#ff4d4d'];
    const chartPlanes = graficoPlanes.rows.map((plan, index) => ({
      ...plan,
      color: colores[index % colores.length]
    }));

    return res.json({
      stats: {
        activos: clientes.rows[0].activos,
        morosos: clientes.rows[0].morosos,
        ingresos: Number(ingresosMes.rows[0].total),
        rutinas: rutinas.rows[0].total,
        // Insertamos los 4 nuevos valores a la respuesta de la API
        nuevosMes: nuevosMesDB.rows[0].total,
        cancelaciones: cancelacionesDB.rows[0].total,
        asistenciaHoy: asistenciaProxyDB.rows[0].total,
        ocupacion: ocupacionDB.rows[0].porcentaje
      },
      chartIngresos: graficoIngresos.rows,
      chartPlanes: chartPlanes,
      chartMembresias: graficoMembresias.rows,
      actividadReciente: actividad.rows,
      topClientes: topClientesDB.rows
    });
    
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

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
  const { desde, hasta, tipo = 'ingresos' } = req.query;
  const values = [];
  const filters = [];

  try {
    // ----------------------------------------------------
    // 1. REPORTE DE INGRESOS (PAGOS)
    // ----------------------------------------------------
    if (tipo === 'ingresos') {
      if (desde) {
        values.push(desde);
        filters.push(`p.fecha_pago::date >= $${values.length}`);
      }
      if (hasta) {
        values.push(hasta);
        filters.push(`p.fecha_pago::date <= $${values.length}`);
      }
      const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

      const [resumen, data] = await Promise.all([
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
            p.id_pago AS id,
            to_char(p.fecha_pago, 'YYYY-MM-DD') AS fecha,
            c.nombre || ' ' || c.apellido AS cliente,
            pl.nombre_plan AS plan,
            p.metodo_pago,
            rec.nombre || ' ' || rec.apellido AS atendido_por,
            p.monto
          FROM pagos p
          INNER JOIN membresias m ON m.id_membresia = p.id_membresia
          INNER JOIN usuarios c ON c.id_usuario = m.id_cliente
          INNER JOIN usuarios rec ON rec.id_usuario = p.id_recepcionista
          INNER JOIN planes pl ON pl.id_plan = m.id_plan
          ${where}
          ORDER BY p.fecha_pago DESC`,
          values
        )
      ]);

      return res.json({
        tipo: 'ingresos',
        kpis: [
          { label: 'Total Ingresos', value: `$${Number(resumen.rows[0].total_ingresos).toFixed(2)}`, tone: 'blue' },
          { label: 'Pagos Procesados', value: resumen.rows[0].cantidad_pagos, tone: 'green' },
          { label: 'Ticket Promedio', value: `$${Number(resumen.rows[0].ticket_promedio).toFixed(2)}`, tone: 'purple' }
        ],
        columnas: ['ID', 'Fecha', 'Cliente', 'Plan', 'Método', 'Atendido Por', 'Monto'],
        filas: data.rows
      });
    }

    // ----------------------------------------------------
    // 2. REPORTE DE CLIENTES MOROSOS
    // ----------------------------------------------------
    if (tipo === 'morosos') {
      const { rows } = await pool.query(
        `SELECT
          u.id_usuario AS id,
          u.nombre || ' ' || u.apellido AS cliente,
          u.email,
          COALESCE(u.telefono, 'N/A') AS telefono,
          pl.nombre_plan AS plan,
          to_char(m.fecha_fin, 'YYYY-MM-DD') AS fecha_vencimiento,
          u.estado
        FROM usuarios u
        INNER JOIN membresias m ON m.id_cliente = u.id_usuario
        INNER JOIN planes pl ON pl.id_plan = m.id_plan
        WHERE u.estado = 'Moroso' OR m.estado = 'Morosa' OR m.fecha_fin < CURRENT_DATE
        ORDER BY m.fecha_fin ASC`
      );

      return res.json({
        tipo: 'morosos',
        kpis: [
          { label: 'Total Morosos', value: rows.length, tone: 'red' },
          { label: 'Membresías Vencidas', value: rows.length, tone: 'red' }
        ],
        columnas: ['ID', 'Cliente', 'Email', 'Teléfono', 'Plan', 'Vencimiento', 'Estado'],
        filas: rows
      });
    }

    // ----------------------------------------------------
    // 3. REPORTE DE NUEVOS REGISTROS / CLIENTES
    // ----------------------------------------------------
    if (tipo === 'nuevos') {
      if (desde) {
        values.push(desde);
        filters.push(`m.fecha_inicio::date >= $${values.length}`);
      }
      if (hasta) {
        values.push(hasta);
        filters.push(`m.fecha_inicio::date <= $${values.length}`);
      }
      const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

      const { rows } = await pool.query(
        `SELECT
          u.id_usuario AS id,
          to_char(m.fecha_inicio, 'YYYY-MM-DD') AS fecha_alta,
          u.nombre || ' ' || u.apellido AS cliente,
          u.email,
          pl.nombre_plan AS plan,
          u.estado
        FROM membresias m
        INNER JOIN usuarios u ON u.id_usuario = m.id_cliente
        INNER JOIN planes pl ON pl.id_plan = m.id_plan
        ${where}
        ORDER BY m.fecha_inicio DESC`,
        values
      );

      return res.json({
        tipo: 'nuevos',
        kpis: [
          { label: 'Nuevas Altas', value: rows.length, tone: 'green' }
        ],
        columnas: ['ID', 'Fecha Alta', 'Cliente', 'Email', 'Plan', 'Estado'],
        filas: rows
      });
    }

  } catch (error) {
    console.error('Error generando reportes:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};


// ==========================================
// MÓDULO DE RUTINAS (CATÁLOGO)
// ==========================================

const getRutinas = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        r.id_rutina AS id, r.nombre, r.grupo, r.nivel, r.duracion, r.calorias, r.tipo_media AS "tipoMedia", r.media_url AS "mediaUrl",
        COALESCE(
          json_agg(
            json_build_object('id', d.id_detalle, 'texto', d.texto, 'series', d.series, 'peso', d.peso)
          ) FILTER (WHERE d.id_detalle IS NOT NULL), '[]'
        ) AS detalles
      FROM rutinas r
      LEFT JOIN detalle_rutinas d ON r.id_rutina = d.id_rutina
      GROUP BY r.id_rutina
      ORDER BY r.id_rutina DESC`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error obteniendo rutinas:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const createRutina = async (req, res) => {
  const { nombre, grupo, nivel, duracion, calorias, tipoMedia, mediaUrl, detalles } = req.body;
  const client = await pool.connect(); // Iniciamos transacción

  try {
    await client.query('BEGIN');

    // 1. Insertamos la rutina base
    const resRutina = await client.query(
      `INSERT INTO rutinas (nombre, grupo, nivel, duracion, calorias, tipo_media, media_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_rutina`,
      [nombre, grupo, nivel, duracion, calorias, tipoMedia, mediaUrl]
    );
    const idRutina = resRutina.rows[0].id_rutina;

    // 2. Insertamos los ejercicios (detalles)
    if (detalles && detalles.length > 0) {
      for (let det of detalles) {
        await client.query(
          `INSERT INTO detalle_rutinas (id_rutina, texto, series, peso) VALUES ($1, $2, $3, $4)`,
          [idRutina, det.texto, det.series, det.peso]
        );
      }
    }

    await client.query('COMMIT');
    return res.status(201).json({ message: 'Rutina creada exitosamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando rutina:', error);
    return res.status(500).json({ message: 'Error al crear la rutina.' });
  } finally {
    client.release();
  }
};

const updateRutina = async (req, res) => {
  const { id } = req.params;
  const { nombre, grupo, nivel, duracion, calorias, tipoMedia, mediaUrl, detalles } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Actualizamos la rutina base
    await client.query(
      `UPDATE rutinas 
       SET nombre = $1, grupo = $2, nivel = $3, duracion = $4, calorias = $5, tipo_media = $6, media_url = $7
       WHERE id_rutina = $8`,
      [nombre, grupo, nivel, duracion, calorias, tipoMedia, mediaUrl, id]
    );

    // 2. Borramos los ejercicios viejos y reinsertamos los nuevos (Método más limpio)
    await client.query(`DELETE FROM detalle_rutinas WHERE id_rutina = $1`, [id]);
    
    if (detalles && detalles.length > 0) {
      for (let det of detalles) {
        await client.query(
          `INSERT INTO detalle_rutinas (id_rutina, texto, series, peso) VALUES ($1, $2, $3, $4)`,
          [id, det.texto, det.series, det.peso]
        );
      }
    }

    await client.query('COMMIT');
    return res.json({ message: 'Rutina actualizada exitosamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error actualizando rutina:', error);
    return res.status(500).json({ message: 'Error al actualizar la rutina.' });
  } finally {
    client.release();
  }
};

const deleteRutina = async (req, res) => {
  try {
    // Nota: Si configuraste "ON DELETE CASCADE" en tu tabla detalle_rutinas, esto borrará todo automáticamente.
    const { rowCount } = await pool.query('DELETE FROM rutinas WHERE id_rutina = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Rutina no encontrada.' });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error eliminando rutina:', error);
    return res.status(500).json({ message: 'Error al eliminar la rutina.' });
  }
};


module.exports = {
  getDashboardStats,
  getUsuarios,
  getUsuarioById,
  getRutinas,
  createRutina,
  updateRutina,
  deleteRutina,
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