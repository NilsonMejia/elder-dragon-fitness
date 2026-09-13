const pool = require('../config/db');

const getEjercicios = async (req, res) => {
  const { grupo_muscular } = req.query;
  const values = [];
  const filters = [];

  if (grupo_muscular) {
    values.push(grupo_muscular);
    filters.push(`grupo_muscular = $${values.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  try {
    const { rows } = await pool.query(
      `SELECT * FROM ejercicios ${where} ORDER BY nombre ASC`,
      values
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error listando ejercicios:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getEjercicioById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM ejercicios WHERE id_ejercicio = $1',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Ejercicio no encontrado.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo ejercicio:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const createEjercicio = async (req, res) => {
  const { nombre, grupo_muscular, descripcion } = req.body;

  if (!nombre || !grupo_muscular) {
    return res.status(400).json({ message: 'Nombre y grupo muscular son obligatorios.' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO ejercicios (nombre, grupo_muscular, descripcion)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [nombre, grupo_muscular, descripcion || null]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creando ejercicio:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const updateEjercicio = async (req, res) => {
  const { nombre, grupo_muscular, descripcion } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE ejercicios
      SET nombre = COALESCE($1, nombre),
        grupo_muscular = COALESCE($2, grupo_muscular),
        descripcion = COALESCE($3, descripcion)
      WHERE id_ejercicio = $4
      RETURNING *`,
      [nombre, grupo_muscular, descripcion, req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Ejercicio no encontrado.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Error actualizando ejercicio:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const deleteEjercicio = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM ejercicios WHERE id_ejercicio = $1',
      [req.params.id]
    );

    if (!rowCount) {
      return res.status(404).json({ message: 'Ejercicio no encontrado.' });
    }

    return res.status(204).send();
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({ message: 'No se puede eliminar un ejercicio usado en rutinas.' });
    }

    console.error('Error eliminando ejercicio:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getRutinas = async (req, res) => {
  const { id_cliente, id_entrenador } = req.query;
  const values = [];
  const filters = [];

  if (id_cliente) {
    values.push(id_cliente);
    filters.push(`ru.id_cliente = $${values.length}`);
  }

  if (id_entrenador) {
    values.push(id_entrenador);
    filters.push(`ru.id_entrenador = $${values.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  try {
    const { rows } = await pool.query(
      `SELECT
        ru.*,
        ent.nombre || ' ' || ent.apellido AS entrenador,
        cli.nombre || ' ' || cli.apellido AS cliente
      FROM rutinas ru
      INNER JOIN usuarios ent ON ent.id_usuario = ru.id_entrenador
      INNER JOIN usuarios cli ON cli.id_usuario = ru.id_cliente
      ${where}
      ORDER BY ru.fecha_asignacion DESC, ru.id_rutina DESC`,
      values
    );

    return res.json(rows);
  } catch (error) {
    console.error('Error listando rutinas:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getRutinaById = async (req, res) => {
  try {
    const rutina = await pool.query(
      `SELECT
        ru.*,
        ent.nombre || ' ' || ent.apellido AS entrenador,
        cli.nombre || ' ' || cli.apellido AS cliente
      FROM rutinas ru
      INNER JOIN usuarios ent ON ent.id_usuario = ru.id_entrenador
      INNER JOIN usuarios cli ON cli.id_usuario = ru.id_cliente
      WHERE ru.id_rutina = $1`,
      [req.params.id]
    );

    if (!rutina.rows.length) {
      return res.status(404).json({ message: 'Rutina no encontrada.' });
    }

    const detalles = await pool.query(
      `SELECT
        dr.*,
        e.nombre AS ejercicio,
        e.grupo_muscular,
        e.descripcion
      FROM detalle_rutinas dr
      INNER JOIN ejercicios e ON e.id_ejercicio = dr.id_ejercicio
      WHERE dr.id_rutina = $1
      ORDER BY dr.id_detalle ASC`,
      [req.params.id]
    );

    return res.json({
      ...rutina.rows[0],
      detalles: detalles.rows,
    });
  } catch (error) {
    console.error('Error obteniendo rutina:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const createRutina = async (req, res) => {
  const {
    id_entrenador,
    id_cliente,
    nombre_rutina,
    fecha_asignacion,
    detalles = [],
  } = req.body;

  if (!id_cliente || !nombre_rutina) {
    return res.status(400).json({ message: 'Cliente y nombre de rutina son obligatorios.' });
  }

  const trainerId = id_entrenador || req.user.userId;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const rutina = await client.query(
      `INSERT INTO rutinas (id_entrenador, id_cliente, nombre_rutina, fecha_asignacion)
      VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE))
      RETURNING *`,
      [trainerId, id_cliente, nombre_rutina, fecha_asignacion || null]
    );

    const detalleRows = [];

    for (const detalle of detalles) {
      const inserted = await client.query(
        `INSERT INTO detalle_rutinas
          (id_rutina, id_ejercicio, series, repeticiones, peso_recomendado_lbs, descanso_segundos)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          rutina.rows[0].id_rutina,
          detalle.id_ejercicio,
          detalle.series,
          detalle.repeticiones,
          detalle.peso_recomendado_lbs ?? null,
          detalle.descanso_segundos ?? null,
        ]
      );
      detalleRows.push(inserted.rows[0]);
    }

    await client.query('COMMIT');

    return res.status(201).json({
      ...rutina.rows[0],
      detalles: detalleRows,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando rutina:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  } finally {
    client.release();
  }
};

const updateRutina = async (req, res) => {
  const {
    id_entrenador,
    id_cliente,
    nombre_rutina,
    fecha_asignacion,
    detalles,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const rutina = await client.query(
      `UPDATE rutinas
      SET id_entrenador = COALESCE($1, id_entrenador),
        id_cliente = COALESCE($2, id_cliente),
        nombre_rutina = COALESCE($3, nombre_rutina),
        fecha_asignacion = COALESCE($4::date, fecha_asignacion)
      WHERE id_rutina = $5
      RETURNING *`,
      [id_entrenador, id_cliente, nombre_rutina, fecha_asignacion || null, req.params.id]
    );

    if (!rutina.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Rutina no encontrada.' });
    }

    let detalleRows = null;

    if (Array.isArray(detalles)) {
      await client.query('DELETE FROM detalle_rutinas WHERE id_rutina = $1', [req.params.id]);
      detalleRows = [];

      for (const detalle of detalles) {
        const inserted = await client.query(
          `INSERT INTO detalle_rutinas
            (id_rutina, id_ejercicio, series, repeticiones, peso_recomendado_lbs, descanso_segundos)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *`,
          [
            req.params.id,
            detalle.id_ejercicio,
            detalle.series,
            detalle.repeticiones,
            detalle.peso_recomendado_lbs ?? null,
            detalle.descanso_segundos ?? null,
          ]
        );
        detalleRows.push(inserted.rows[0]);
      }
    }

    await client.query('COMMIT');

    return res.json({
      ...rutina.rows[0],
      detalles: detalleRows,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error actualizando rutina:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  } finally {
    client.release();
  }
};

const deleteRutina = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM detalle_rutinas WHERE id_rutina = $1', [req.params.id]);
    const { rowCount } = await client.query('DELETE FROM rutinas WHERE id_rutina = $1', [req.params.id]);

    if (!rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Rutina no encontrada.' });
    }

    await client.query('COMMIT');
    return res.status(204).send();
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error eliminando rutina:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  } finally {
    client.release();
  }
};

module.exports = {
  getEjercicios,
  getEjercicioById,
  createEjercicio,
  updateEjercicio,
  deleteEjercicio,
  getRutinas,
  getRutinaById,
  createRutina,
  updateRutina,
  deleteRutina,
};
