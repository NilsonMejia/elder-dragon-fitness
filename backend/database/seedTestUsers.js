const bcrypt = require('bcrypt');
const pool = require('../config/db');

const TEST_PASSWORD = process.env.SEED_TEST_PASSWORD || 'Temporal123!';

const roles = ['Administrador', 'Recepcionista', 'Entrenador', 'Cliente'];

const users = [
  {
    rol: 'Administrador',
    nombre: 'Admin',
    apellido: 'Elder Dragon',
    email: 'admin@elderdragon.com',
    telefono: '7000-0001',
  },
  {
    rol: 'Recepcionista',
    nombre: 'Recepcion',
    apellido: 'Elder Dragon',
    email: 'recepcion@elderdragon.com',
    telefono: '7000-0002',
  },
  {
    rol: 'Entrenador',
    nombre: 'Entrenador',
    apellido: 'Elder Dragon',
    email: 'entrenador@elderdragon.com',
    telefono: '7000-0003',
  },
  {
    rol: 'Cliente',
    nombre: 'Cliente',
    apellido: 'Elder Dragon',
    email: 'cliente@elderdragon.com',
    telefono: '7000-0004',
  },
];

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const role of roles) {
      await client.query(
        `INSERT INTO roles (nombre_rol)
        VALUES ($1)
        ON CONFLICT (nombre_rol) DO NOTHING`,
        [role]
      );
    }

    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

    for (const user of users) {
      const roleResult = await client.query(
        'SELECT id_rol FROM roles WHERE nombre_rol = $1',
        [user.rol]
      );

      await client.query(
        `INSERT INTO usuarios (
          id_rol, nombre, apellido, email, password_hash, telefono, estado, debe_cambiar_password
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'Activo', false)
        ON CONFLICT (email) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
          estado = 'Activo',
          debe_cambiar_password = false`,
        [
          roleResult.rows[0].id_rol,
          user.nombre,
          user.apellido,
          user.email,
          passwordHash,
          user.telefono,
        ]
      );
    }

    await client.query(
      "UPDATE usuarios SET password_hash = $1, debe_cambiar_password = false WHERE password_hash = 'hash_123'",
      [passwordHash]
    );

    await client.query('COMMIT');

    console.log('Usuarios de prueba listos.');
    console.log(`Password de prueba: ${TEST_PASSWORD}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error ejecutando seed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
