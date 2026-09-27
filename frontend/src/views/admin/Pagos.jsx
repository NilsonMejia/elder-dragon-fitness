import { useCallback, useEffect, useState } from 'react';
import { AdminPageShell } from './Dashboard';
import PaymentForm from '../../components/PaymentForm';
import { Notice } from '../../components/Notifications';
import { api } from '../../lib/api';
import '../../css/admin-payments.css';

export default function Pagos() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/recepcion/pagos');
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial de pagos.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    api('/recepcion/pagos')
      .then(data => { if (active) setPayments(Array.isArray(data) ? data : []); })
      .catch(err => { if (active) setError(err.message || 'No se pudo cargar el historial de pagos.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <AdminPageShell>
      <div className="admin-payments">
        <header className="payments-heading">
          <h1>Gestión de pagos</h1>
          <p>Registra mensualidades y consulta los recibos y la vigencia de las membresías.</p>
        </header>
        <PaymentForm onRegistered={loadPayments} />
        <section className="panel-recep" aria-labelledby="payment-history-title">
          <div className="payments-history-heading">
            <h2 id="payment-history-title">Historial de pagos</h2>
            <button type="button" className="btn-recep-primary" onClick={loadPayments} disabled={loading}>
              {error ? 'Reintentar' : 'Actualizar historial'}
            </button>
          </div>
          <Notice message={error} type="error" onClose={() => setError('')} />
          {loading ? <p role="status">Cargando pagos...</p> : error ? (
            <p>No se pudo cargar el historial. Usa Reintentar para consultarlo nuevamente.</p>
          ) : payments.length === 0 ? <p>Aún no hay pagos registrados.</p> : (
            <div className="payments-table-wrap" tabIndex={0} role="region" aria-label="Historial de pagos, desplaza horizontalmente para ver todas las columnas">
              <table>
                <caption>{payments.length} pagos registrados</caption>
                <thead><tr>{['Recibo', 'Cliente', 'Plan', 'Fecha', 'Monto', 'Método', 'Registrado por'].map(title => <th key={title} scope="col">{title}</th>)}</tr></thead>
                <tbody>{payments.map(payment => (
                  <tr key={payment.id_pago}>
                    <td>{payment.num_factura_electronica || 'Sin número'}</td>
                    <td>{payment.cliente}</td>
                    <td>{payment.nombre_plan}</td>
                    <td>{new Date(payment.fecha_pago).toLocaleDateString('es-SV')}</td>
                    <td>{Number(payment.monto).toLocaleString('es-SV', { style: 'currency', currency: 'USD' })}</td>
                    <td>{payment.metodo_pago}</td>
                    <td>{payment.recepcionista}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}
