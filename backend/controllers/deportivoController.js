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

// Catalog shares the same schema as the administrator module.
const {getRutinas,createRutina,updateRutina,deleteRutina}=require('./adminController');
const getRutinaById=async(req,res)=>{
  const result=await pool.query('SELECT * FROM rutinas WHERE id_rutina=$1',[req.params.id]);
  if(!result.rowCount) return res.status(404).json({message:'Rutina no encontrada.'});
  const details=await pool.query('SELECT * FROM detalle_rutinas WHERE id_rutina=$1 ORDER BY id_detalle',[req.params.id]);
  res.json({...result.rows[0],detalles:details.rows});
};
module.exports={getEjercicios,getEjercicioById,createEjercicio,updateEjercicio,deleteEjercicio,getRutinas,getRutinaById,createRutina,updateRutina,deleteRutina};
