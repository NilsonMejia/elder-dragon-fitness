const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(847231)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    for (const name of (await fs.readdir(path.join(__dirname, 'migrations'))).filter(n => n.endsWith('.sql')).sort()) {
      const done = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
      if (done.rowCount) continue;
      await client.query(await fs.readFile(path.join(__dirname, 'migrations', name), 'utf8'));
      await client.query('INSERT INTO schema_migrations(name) VALUES ($1)', [name]);
      console.log(`Migración aplicada: ${name}`);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
if (require.main === module) migrate().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
module.exports = migrate;
