const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('../config/env');
const { prepareDeliveryDemo } = require('../scripts/prepare-delivery-demo');

test('delivery fixture is repeatable, preserves unrelated data/passwords and rejects identity collisions', async () => {
  const database = `edf_demo_test_${process.pid}_${Date.now()}`;
  const connection = { host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 5432), user: process.env.DB_USER, password: process.env.DB_PASSWORD };
  const admin = new Pool({ ...connection, database: 'postgres' });
  const pool = new Pool({ ...connection, database });
  let created = false;
  try {
    assert.match(database, /^edf_demo_test_[0-9_]+$/);
    await admin.query(`CREATE DATABASE "${database}"`);
    created = true;
    for (const file of ['schema.sql', 'demo-data.sql', 'migrations/001_complete_workflows.sql', 'migrations/002_catalog_repetitions.sql', 'migrations/003_data_checks.sql']) {
      await pool.query(await fs.readFile(path.join(__dirname, '../database', file), 'utf8'));
    }
    const tables = ['usuarios', 'planes', 'pagos', 'membresias', 'rutinas', 'detalle_rutinas'];
    const before = {};
    for (const table of tables) before[table] = (await pool.query(`SELECT * FROM ${table} ORDER BY 1`)).rows;
    const first = await prepareDeliveryDemo(pool, 'Demo-test-only-123!');
    const hashes = (await pool.query('SELECT password_hash FROM usuarios WHERE id_usuario=ANY($1) ORDER BY id_usuario', [[first.clientId, first.trainerId]])).rows;
    assert.equal(await bcrypt.compare('Demo-test-only-123!', hashes[0].password_hash), true);
    assert.deepEqual(await prepareDeliveryDemo(pool, 'Different-password-123!'), first);
    assert.deepEqual((await pool.query('SELECT password_hash FROM usuarios WHERE id_usuario=ANY($1) ORDER BY id_usuario', [[first.clientId, first.trainerId]])).rows, hashes);
    assert.equal((await pool.query('SELECT count(*)::int n FROM rutina_asignaciones')).rows[0].n, 1);
    assert.equal((await pool.query('SELECT count(*)::int n FROM rutina_seguimiento WHERE completada')).rows[0].n, 1);
    for (const table of tables) {
      const after = (await pool.query(`SELECT * FROM ${table} ORDER BY 1`)).rows;
      assert.deepEqual(table === 'usuarios' ? after.filter(user => ![first.clientId, first.trainerId].includes(user.id_usuario)) : after, before[table]);
    }
    await pool.query("UPDATE usuarios SET nombre='Cuenta ajena' WHERE id_usuario=$1", [first.clientId]);
    await assert.rejects(prepareDeliveryDemo(pool), /no coincide/);
    assert.equal((await pool.query('SELECT count(*)::int n FROM rutina_seguimiento')).rows[0].n, 1);
  } finally {
    await pool.end();
    if (created) await admin.query(`DROP DATABASE "${database}"`);
    await admin.end();
  }
});
