const pool = require('../config/db');

// Membership intervals are [fecha_inicio, fecha_fin). Inactivo is an administrative suspension.
async function syncMemberships(db = pool) {
  await db.query("UPDATE membresias SET estado = 'Morosa' WHERE estado = 'Activa' AND fecha_fin <= CURRENT_DATE");
  await db.query(`UPDATE usuarios u SET estado = CASE
    WHEN EXISTS (SELECT 1 FROM membresias m WHERE m.id_cliente=u.id_usuario AND m.estado='Activa'
      AND m.fecha_inicio <= CURRENT_DATE AND m.fecha_fin > CURRENT_DATE) THEN 'Activo'
    ELSE 'Moroso' END
    FROM roles r WHERE r.id_rol=u.id_rol AND r.nombre_rol='Cliente' AND u.estado <> 'Inactivo'
    AND EXISTS (SELECT 1 FROM membresias m WHERE m.id_cliente=u.id_usuario)`);
}

const currentMembershipJoin = `LEFT JOIN LATERAL (
  SELECT * FROM membresias mm WHERE mm.id_cliente = u.id_usuario
  ORDER BY (mm.estado='Activa' AND mm.fecha_inicio <= CURRENT_DATE AND mm.fecha_fin > CURRENT_DATE) DESC,
    mm.fecha_fin DESC, mm.id_membresia DESC LIMIT 1
) m ON true`;

async function alerts() {
  const { rows } = await pool.query(`SELECT u.id_usuario, u.nombre, u.apellido, u.estado,
    to_char(m.fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
    CASE WHEN m.fecha_fin <= CURRENT_DATE THEN 'Vencida' ELSE 'Por vencer' END AS tipo
    FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol
    ${currentMembershipJoin}
    CROSS JOIN configuracion c
    WHERE r.nombre_rol='Cliente' AND u.estado <> 'Inactivo' AND c.id=1
    AND (c.datos->>'alertasMorosos')::boolean
    AND m.estado <> 'Inactiva'
    AND m.fecha_fin <= CURRENT_DATE + (c.datos->>'diasAviso')::int
    AND NOT EXISTS (SELECT 1 FROM membresias futura WHERE futura.id_cliente=u.id_usuario
      AND futura.estado='Activa' AND futura.fecha_inicio <= m.fecha_fin AND futura.fecha_fin > m.fecha_fin)
    ORDER BY m.fecha_fin, u.id_usuario`);
  return rows;
}
module.exports = { syncMemberships, currentMembershipJoin, alerts };
