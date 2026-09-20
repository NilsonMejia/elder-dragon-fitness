const pool = require('../config/db');

exports.registrarPago = async (req, res) => {
  const { id_cliente, id_plan, monto, metodo_pago, idempotency_key } = req.body;
  if (!Number.isInteger(Number(id_cliente)) || Number(id_cliente) < 1 || !Number.isInteger(Number(id_plan)) || Number(id_plan) < 1 ||
      !Number.isFinite(Number(monto)) || Number(monto) <= 0 ||
      !['efectivo', 'tarjeta', 'transferencia'].includes(String(metodo_pago).toLowerCase()) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotency_key || '')) {
    return res.status(400).json({ message: 'Cliente, plan, monto, método y clave de operación válidos son obligatorios.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [idempotency_key]);
    const previous = await client.query(`SELECT p.*, m.id_cliente, m.id_plan FROM pagos p JOIN membresias m USING(id_membresia) WHERE idempotency_key=$1`, [idempotency_key]);
    if (previous.rowCount) {
      const p = previous.rows[0];
      if (p.id_cliente !== Number(id_cliente) || p.id_plan !== Number(id_plan) || Number(p.monto) !== Number(monto) || p.metodo_pago.toLowerCase() !== metodo_pago.toLowerCase() || p.id_recepcionista !== req.user.userId) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'Esta clave ya pertenece a otro pago.' });
      }
      const m = await client.query('SELECT * FROM membresias WHERE id_membresia=$1', [p.id_membresia]);
      await client.query('COMMIT');
      return res.json({ pago: p, membresia: m.rows[0], repetido: true });
    }
    const customer = await client.query(`SELECT u.* FROM usuarios u JOIN roles r USING(id_rol)
      WHERE u.id_usuario=$1 AND r.nombre_rol='Cliente' FOR UPDATE OF u`, [id_cliente]);
    if (!customer.rowCount || customer.rows[0].estado === 'Inactivo') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Selecciona un cliente existente que no esté suspendido.' });
    }
    const plan = await client.query('SELECT * FROM planes WHERE id_plan=$1 FOR SHARE', [id_plan]);
    if (!plan.rowCount || Number(plan.rows[0].precio) !== Number(monto) || plan.rows[0].duracion_dias < 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'El monto debe coincidir con el precio actual del plan.' });
    }
    const membership = await client.query(`INSERT INTO membresias(id_cliente,id_plan,fecha_inicio,fecha_fin,estado)
      SELECT $1,$2,inicio,inicio + $3::int,'Activa' FROM (
        SELECT GREATEST(CURRENT_DATE, COALESCE(MAX(fecha_fin),CURRENT_DATE)) AS inicio
        FROM membresias WHERE id_cliente=$1 AND estado='Activa'
      ) fechas RETURNING *`, [id_cliente, id_plan, plan.rows[0].duracion_dias]);
    const payment = await client.query(`INSERT INTO pagos(id_membresia,id_recepcionista,monto,metodo_pago,num_factura_electronica,idempotency_key)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING *`, [membership.rows[0].id_membresia, req.user.userId, plan.rows[0].precio, metodo_pago.toLowerCase(), `REC-${idempotency_key}`, idempotency_key]);
    await client.query("UPDATE usuarios SET estado='Activo' WHERE id_usuario=$1", [id_cliente]);
    await client.query('COMMIT');
    return res.status(201).json({ membresia: membership.rows[0], pago: payment.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
};

exports.preview = async (req, res) => {
  const { rows } = await pool.query(`SELECT to_char(inicio,'YYYY-MM-DD') AS fecha_inicio,
    to_char(inicio + p.duracion_dias,'YYYY-MM-DD') AS fecha_fin, p.precio
    FROM planes p CROSS JOIN (
      SELECT GREATEST(CURRENT_DATE, COALESCE(MAX(fecha_fin),CURRENT_DATE)) AS inicio
      FROM membresias WHERE id_cliente=$1 AND estado='Activa'
    ) fechas WHERE p.id_plan=$2`, [req.query.id_cliente, req.query.id_plan]);
  if (!rows.length) return res.status(404).json({ message: 'Plan no encontrado.' });
  res.json(rows[0]);
};
