const pool = require('../config/db');
const bcrypt = require('bcrypt');
const defaults = { nombreLegal: 'Elder Dragon Fitness', direccion: '', telefono: '', correo: '', moneda: 'USD', alertasMorosos: true, diasAviso: 7, modoMantenimiento: false };

exports.getSettings = async (req, res) => {
  const { rows } = await pool.query('SELECT datos, actualizado_en FROM configuracion WHERE id=1');
  res.json({ ...rows[0], defaults, database: 'Conectada' });
};
exports.saveSettings = async (req, res) => {
  const datos = Object.fromEntries(Object.keys(defaults).map(key => [key, req.body[key] ?? defaults[key]]));
  if (typeof datos.nombreLegal !== 'string' || !datos.nombreLegal.trim() || datos.nombreLegal.length > 150 ||
      !['direccion', 'telefono', 'correo'].every(k => typeof datos[k] === 'string' && datos[k].length <= 250) ||
      datos.moneda !== 'USD' || !Number.isInteger(Number(datos.diasAviso)) || Number(datos.diasAviso) < 0 || Number(datos.diasAviso) > 60 ||
      typeof datos.alertasMorosos !== 'boolean' || typeof datos.modoMantenimiento !== 'boolean') {
    return res.status(400).json({ message: 'Configuración inválida. Los importes del sistema están expresados en USD.' });
  }
  datos.diasAviso = Number(datos.diasAviso);
  await pool.query('UPDATE configuracion SET datos=$1, actualizado_en=now() WHERE id=1', [datos]);
  res.json({ message: 'Configuración guardada.', datos });
};
exports.changePassword = async (req, res) => {
  const { actual, nueva } = req.body;
  if (typeof actual !== 'string' || typeof nueva !== 'string' || nueva.length < 8 || Buffer.byteLength(nueva) > 72) return res.status(400).json({ message: 'Usa una contraseña de 8 a 72 bytes.' });
  const { rows } = await pool.query('SELECT password_hash FROM usuarios WHERE id_usuario=$1', [req.user.userId]);
  if (!await bcrypt.compare(actual, rows[0].password_hash)) return res.status(400).json({ message: 'Contraseña actual incorrecta.' });
  await pool.query('UPDATE usuarios SET password_hash=$1, token_version=token_version+1 WHERE id_usuario=$2', [await bcrypt.hash(nueva, 10), req.user.userId]);
  res.json({ message: 'Contraseña actualizada. Inicia sesión de nuevo.' });
};
