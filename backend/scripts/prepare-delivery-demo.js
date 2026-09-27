const bcrypt = require('bcrypt');

const accounts = [
  { role: 'Entrenador', nombre: 'DEMO Entrenador', email: 'entrenador.entrega@example.invalid' },
  { role: 'Cliente', nombre: 'DEMO Cliente', email: 'cliente.entrega@example.invalid' },
];
const assignmentName = 'DEMO entrega - rutina inicial';
const observation = 'DEMO entrega: sesión simulada completada; registro ficticio para demostrar el seguimiento.';
const details = [
  { texto: 'Sentadilla', series: '3', repeticiones: '10', peso: 'Peso corporal', descanso_segundos: 60 },
  { texto: 'Remo con mancuerna', series: '3', repeticiones: '12', peso: '5 lb (demostración)', descanso_segundos: 60 },
];

async function prepareDeliveryDemo(pool, password = process.env.SEED_TEST_PASSWORD || 'Temporal123!') {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    // Serialize repeated/concurrent invocations of this fixture.
    await db.query("SELECT pg_advisory_xact_lock(hashtext('edf-delivery-demo-v1'))");
    const ids = [];
    for (const account of accounts) {
      const existing = await db.query(`SELECT u.*, r.nombre_rol FROM usuarios u
        LEFT JOIN roles r USING(id_rol) WHERE lower(u.email)=lower($1)`, [account.email]);
      if (existing.rows.length) {
        const user = existing.rows[0];
        if (existing.rows.length !== 1 || user.nombre !== account.nombre || user.apellido !== 'Entrega' || user.nombre_rol !== account.role) {
          throw new Error(`La cuenta ${account.email} ya existe y no coincide con la identidad DEMO; no se modificó.`);
        }
        ids.push(user.id_usuario);
        continue;
      }
      await db.query('INSERT INTO roles(nombre_rol) VALUES($1) ON CONFLICT DO NOTHING', [account.role]);
      const { rows } = await db.query(`INSERT INTO usuarios(id_rol,nombre,apellido,email,password_hash,estado,debe_cambiar_password)
        VALUES((SELECT id_rol FROM roles WHERE nombre_rol=$1),$2,'Entrega',$3,$4,'Activo',false) RETURNING id_usuario`,
      [account.role, account.nombre, account.email, await bcrypt.hash(password, 10)]);
      ids.push(rows[0].id_usuario);
    }
    const [trainerId, clientId] = ids;
    let assignment = (await db.query('SELECT * FROM rutina_asignaciones WHERE id_cliente=$1 ORDER BY id_asignacion', [clientId])).rows;
    if (assignment.length && (assignment.length !== 1 || assignment[0].id_entrenador !== trainerId || assignment[0].nombre !== assignmentName)) {
      throw new Error('El cliente DEMO ya tiene otras asignaciones. No se reemplazó su trabajo.');
    }
    if (!assignment.length) {
      assignment = (await db.query(`INSERT INTO rutina_asignaciones(id_cliente,id_entrenador,nombre,detalles,notas)
        VALUES($1,$2,$3,$4,'Datos ficticios para la entrega; no representan actividad real.') RETURNING *`,
      [clientId, trainerId, assignmentName, JSON.stringify(details)])).rows;
    }
    const assignmentId = assignment[0].id_asignacion;
    await db.query(`INSERT INTO rutina_seguimiento(id_asignacion,id_autor,observaciones,completada)
      SELECT $1,$2,$3,true WHERE NOT EXISTS(SELECT 1 FROM rutina_seguimiento
      WHERE id_asignacion=$1 AND id_autor=$2 AND observaciones=$3)`, [assignmentId, clientId, observation]);
    await db.query('COMMIT');
    return { trainerId, clientId, assignmentId, emails: accounts.map(account => account.email) };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    db.release();
  }
}

if (require.main === module) {
  const pool = require('../config/db');
  prepareDeliveryDemo(pool).then(result => {
    console.log('Demostración preparada:', result);
    console.log('Cuentas nuevas: contraseña de SEED_TEST_PASSWORD o valor predeterminado del entorno de desarrollo. Las contraseñas existentes se conservan.');
    console.log('No se crearon membresías ni pagos. Los usuarios DEMO aparecen en los listados de usuarios/clientes.');
  }).catch(error => {
    console.error('No se preparó la demostración:', error.message);
    process.exitCode = 1;
  }).finally(() => pool.end());
}

module.exports = { prepareDeliveryDemo };
