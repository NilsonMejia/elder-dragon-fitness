const pool = require('../config/db');
const memberships = require('./membershipService');

function membershipNotice(row, href, personal = false) {
  const expired = row.tipo === 'Vencida';
  return {
    id: `membership-${row.id_usuario}-${row.fecha_fin}`,
    kind: 'membership',
    title: expired ? 'Membresía vencida' : 'Membresía por vencer',
    message: `${personal ? 'Tu membresía' : `La membresía de ${row.nombre} ${row.apellido}`} ${expired ? 'venció' : 'vence'} el ${row.fecha_fin}.`,
    date: row.fecha_fin,
    href,
  };
}

async function list(user) {
  if (['Administrador', 'Recepcionista'].includes(user.rol)) {
    const href = user.rol === 'Administrador' ? '/admin/usuarios' : '/recepcion/clientes';
    return (await memberships.alerts()).map(row => membershipNotice(row, href));
  }
  if (user.rol === 'Cliente') {
    const membership = await pool.query(`SELECT u.id_usuario,
      to_char(m.fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
      CASE WHEN m.fecha_fin <= CURRENT_DATE THEN 'Vencida' ELSE 'Por vencer' END AS tipo
      FROM usuarios u ${memberships.currentMembershipJoin}
      CROSS JOIN configuracion c
      WHERE u.id_usuario=$1 AND c.id=1 AND (c.datos->>'alertasMorosos')::boolean
      AND m.estado <> 'Inactiva' AND m.fecha_fin <= CURRENT_DATE + (c.datos->>'diasAviso')::int
      AND NOT EXISTS (SELECT 1 FROM membresias futura WHERE futura.id_cliente=u.id_usuario
        AND futura.estado='Activa' AND futura.fecha_inicio <= m.fecha_fin AND futura.fecha_fin > m.fecha_fin)`, [user.userId]);
    const assignments = await pool.query(`SELECT id_asignacion,nombre,
      to_char(fecha_asignacion,'YYYY-MM-DD') AS fecha
      FROM rutina_asignaciones WHERE id_cliente=$1 AND activa`, [user.userId]);
    const feedback = await pool.query(`SELECT s.id_seguimiento,s.fecha,s.observaciones,a.nombre
      FROM rutina_seguimiento s JOIN rutina_asignaciones a USING(id_asignacion)
      WHERE a.id_cliente=$1 AND a.activa AND s.id_autor=a.id_entrenador
      AND s.fecha >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      ORDER BY s.fecha DESC,s.id_seguimiento DESC LIMIT 20`, [user.userId]);
    return [
      ...membership.rows.map(row => membershipNotice(row, '/cliente/perfil', true)),
      ...assignments.rows.map(row => ({ id: `routine-${row.id_asignacion}`, kind: 'routine', title: 'Rutina asignada', message: row.nombre, date: row.fecha, href: '/cliente/rutina' })),
      ...feedback.rows.map(row => ({ id: `feedback-${row.id_seguimiento}`, kind: 'feedback', title: `Comentario del entrenador: ${row.nombre}`, message: row.observaciones, date: row.fecha, href: '/cliente/rutina' })),
    ];
  }
  if (user.rol === 'Entrenador') {
    const { rows } = await pool.query(`SELECT s.id_seguimiento,s.fecha,s.observaciones,a.nombre,
      u.nombre || ' ' || u.apellido AS cliente
      FROM rutina_seguimiento s JOIN rutina_asignaciones a USING(id_asignacion)
      JOIN usuarios u ON u.id_usuario=a.id_cliente
      WHERE a.id_entrenador=$1 AND s.id_autor=a.id_cliente
      AND s.fecha >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      ORDER BY s.fecha DESC,s.id_seguimiento DESC LIMIT 20`, [user.userId]);
    return rows.map(row => ({ id: `progress-${row.id_seguimiento}`, kind: 'progress', title: `Progreso de ${row.cliente}`, message: `${row.nombre}: ${row.observaciones}`, date: row.fecha, href: '/entrenador' }));
  }
  return [];
}

module.exports = { list };
