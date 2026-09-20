const pool = require('../config/db');
const { normalizeDetails } = require('../services/routineService');

exports.clients = async (req, res) => {
  const { rows } = await pool.query(`SELECT u.id_usuario,u.nombre,u.apellido,u.estado FROM usuarios u JOIN roles r USING(id_rol) WHERE r.nombre_rol='Cliente' ORDER BY u.nombre,u.apellido`);
  res.json(rows);
};
exports.list = async (req, res) => {
  const { rows } = await pool.query(`SELECT a.*, u.nombre || ' ' || u.apellido AS cliente,
    e.nombre || ' ' || e.apellido AS entrenador FROM rutina_asignaciones a
    JOIN usuarios u ON u.id_usuario=a.id_cliente JOIN usuarios e ON e.id_usuario=a.id_entrenador
    WHERE ($1::boolean OR a.id_entrenador=$2) ORDER BY a.id_asignacion DESC`, [req.user.rol === 'Administrador', req.user.userId]);
  res.json(rows);
};
exports.create = async (req, res) => {
  const { id_cliente, id_plantilla, nombre, notas = '' } = req.body;
  const detalles = normalizeDetails(req.body.detalles);
  if (typeof nombre !== 'string' || !nombre.trim() || nombre.length > 100 || typeof notas !== 'string' || notas.length > 5000) return res.status(400).json({ message: 'Nombre o notas inválidos.' });
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const user = await db.query(`SELECT u.id_usuario FROM usuarios u JOIN roles r USING(id_rol) WHERE u.id_usuario=$1 AND r.nombre_rol='Cliente' AND u.estado <> 'Inactivo' FOR UPDATE OF u`, [id_cliente]);
    if (!user.rowCount) { await db.query('ROLLBACK'); return res.status(400).json({ message: 'Cliente inválido o suspendido.' }); }
    await db.query('UPDATE rutina_asignaciones SET activa=false WHERE id_cliente=$1 AND activa', [id_cliente]);
    const { rows } = await db.query(`INSERT INTO rutina_asignaciones(id_cliente,id_entrenador,id_plantilla,nombre,detalles,notas)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING *`, [id_cliente, req.user.userId, id_plantilla || null, nombre.trim(), JSON.stringify(detalles), notas]);
    await db.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
};
async function accessible(req) {
  const { rows } = await pool.query(`SELECT * FROM rutina_asignaciones WHERE id_asignacion=$1
    AND ($2::boolean OR id_entrenador=$3 OR ($4::boolean AND id_cliente=$3))`, [req.params.id, req.user.rol === 'Administrador', req.user.userId, req.user.rol === 'Cliente']);
  return rows[0];
}
exports.history = async (req, res) => {
  if (!await accessible(req)) return res.status(404).json({ message: 'Asignación no encontrada.' });
  const { rows } = await pool.query(`SELECT s.*,u.nombre || ' ' || u.apellido AS autor FROM rutina_seguimiento s JOIN usuarios u ON u.id_usuario=s.id_autor WHERE id_asignacion=$1 ORDER BY fecha DESC, id_seguimiento DESC`, [req.params.id]);
  res.json(rows);
};
exports.progress = async (req, res) => {
  const assignment = await accessible(req);
  if (!assignment) return res.status(404).json({ message: 'Asignación no encontrada.' });
  if (!assignment.activa) return res.status(409).json({ message: 'Esta rutina ya fue archivada.' });
  const { observaciones, completada = false } = req.body;
  if (typeof observaciones !== 'string' || !observaciones.trim() || observaciones.length > 5000 || typeof completada !== 'boolean') return res.status(400).json({ message: 'Escribe observaciones de hasta 5000 caracteres.' });
  const { rows } = await pool.query(`INSERT INTO rutina_seguimiento(id_asignacion,id_autor,observaciones,completada) VALUES($1,$2,$3,$4) RETURNING *`, [req.params.id, req.user.userId, observaciones.trim(), completada]);
  res.status(201).json(rows[0]);
};
exports.archive = async (req, res) => {
  if (!await accessible(req)) return res.status(404).json({ message: 'Asignación no encontrada.' });
  await pool.query('UPDATE rutina_asignaciones SET activa=false WHERE id_asignacion=$1', [req.params.id]);
  res.sendStatus(204);
};
exports.mine = async (req, res) => {
  const { rows } = await pool.query(`SELECT a.*, e.nombre || ' ' || e.apellido AS entrenador
    FROM rutina_asignaciones a JOIN usuarios e ON e.id_usuario=a.id_entrenador
    WHERE a.id_cliente=$1 AND a.activa`, [req.user.userId]);
  const a = rows[0];
  res.json(a ? { ...a, detalles: a.detalles.map((d,i) => ({ ...d, id:i+1, ejercicio:d.texto })) } : null);
};
