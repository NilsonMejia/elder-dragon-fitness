const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/db');
const migrate = require('./migrate');
async function init() {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const exists = await db.query("SELECT to_regclass('public.usuarios') AS users");
    if (exists.rows[0].users) throw new Error('La base ya contiene usuarios. Usa db:migrate; no se sobrescribieron datos.');
    await db.query(await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8'));
    if (process.argv.includes('--demo')) await db.query(await fs.readFile(path.join(__dirname, 'demo-data.sql'), 'utf8'));
    await db.query('COMMIT');
  } catch (error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
  await migrate();
  console.log('Esquema inicializado. Ejecuta db:seed para crear los accesos de prueba.');
}
init().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
