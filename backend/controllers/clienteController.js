const pool = require('../config/db');

const getMiPerfil = async (req, res) => {
  try {
    const perfil = await pool.query(
      `SELECT
        u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.estado,
        m.id_membresia, m.fecha_inicio, m.fecha_fin, m.estado AS estado_membresia,
        p.id_plan, p.nombre_plan
      FROM usuarios u
      INNER JOIN roles r ON r.id_rol = u.id_rol
      LEFT JOIN LATERAL (
        SELECT *
        FROM membresias mm
        WHERE mm.id_cliente = u.id_usuario
        ORDER BY (mm.estado='Activa' AND mm.fecha_inicio <= CURRENT_DATE AND mm.fecha_fin > CURRENT_DATE) DESC, mm.fecha_fin DESC, mm.id_membresia DESC
        LIMIT 1
      ) m ON true
      LEFT JOIN planes p ON p.id_plan = m.id_plan
      WHERE u.id_usuario = $1 AND r.nombre_rol = 'Cliente'`,
      [req.user.userId]
    );

    if (!perfil.rows.length) {
      return res.status(404).json({ message: 'Perfil de cliente no encontrado.' });
    }

    const pagos = await pool.query(
      `SELECT
        pg.id_pago, pg.monto, pg.fecha_pago, pg.metodo_pago, pg.num_factura_electronica,
        pl.nombre_plan
      FROM pagos pg
      INNER JOIN membresias m ON m.id_membresia = pg.id_membresia
      INNER JOIN planes pl ON pl.id_plan = m.id_plan
      WHERE m.id_cliente = $1
      ORDER BY pg.fecha_pago DESC
      LIMIT 5`,
      [req.user.userId]
    );

    return res.json({
      cliente: perfil.rows[0],
      pagos: pagos.rows,
    });
  } catch (error) {
    console.error('Error obteniendo perfil de cliente:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const { mine: getMiRutina } = require('./assignmentController');
module.exports={getMiPerfil,getMiRutina};
