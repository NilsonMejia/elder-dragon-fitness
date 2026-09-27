import { Notice } from './Notifications';
import { useEffect, useMemo, useState, useRef } from 'react';
import '../css/Recepcion.css';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PaymentForm({ onRegistered }) {
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [idPlan, setIdPlan] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [preview,setPreview]=useState(null);
  const paymentOperation=useRef(null);

  // ==========================================
  // VALIDACIÓN DE USUARIO Y SESIÓN
  // ==========================================
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setMensaje('Sesión no encontrada.');
        setLoading(false);
        return;
      }

      try {
        const [clientesResponse, planesResponse] = await Promise.all([
          fetch(`${API_URL}/recepcion/clientes`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/recepcion/planes`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const clientesData = await clientesResponse.json();
        const planesData = await planesResponse.json();

        if (!clientesResponse.ok) throw new Error(clientesData.message || 'Error al cargar clientes.');
        if (!planesResponse.ok) throw new Error(planesData.message || 'Error al cargar planes.');

        setClientes(Array.isArray(clientesData) ? clientesData : []);
        setPlanes(Array.isArray(planesData) ? planesData : []);
      } catch (fetchError) {
        setMensaje(fetchError.message);
        setClientes([]); 
        setPlanes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const sugerenciasClientes = useMemo(() => {
    const texto = clienteBusqueda?.trim().toLowerCase() || '';
    if (!texto || !Array.isArray(clientes)) return [];

    return clientes.filter((cliente) => {
      const id = `ed-${String(cliente.id_usuario || '').padStart(3, '0')}`;
      const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
      return id.includes(texto) || nombreCompleto.includes(texto);
    }).slice(0, 6);
  }, [clienteBusqueda, clientes]);

  const clienteSeleccionado = useMemo(() => {
    const texto = clienteBusqueda?.trim().toLowerCase() || '';
    if (!texto || !Array.isArray(clientes)) return null;

    return clientes.find((cliente) => {
      const id = `ed-${String(cliente.id_usuario || '').padStart(3, '0')}`.toLowerCase();
      const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
      return id === texto || nombreCompleto === texto;
    }) || null;
  }, [clienteBusqueda, clientes]);

  const planSeleccionado = useMemo(() => {
    if (!Array.isArray(planes)) return null;
    return planes.find((plan) => String(plan.id_plan) === String(idPlan)) || null;
  }, [idPlan, planes]);

  const customerId=clienteSeleccionado?.id_usuario;
  const planId=planSeleccionado?.id_plan;
  useEffect(()=>{let active=true;if(customerId&&planId)fetch(API_URL+'/recepcion/renovacion?id_cliente='+customerId+'&id_plan='+planId,{headers:{Authorization:'Bearer '+token}}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.message);return d;}).then(d=>{if(active)setPreview({...d,customerId,planId});}).catch(e=>{if(active)setMensaje(e.message);});return()=>{active=false;};},[customerId,planId,token]);
  const validPreview=preview&&preview.customerId===customerId&&preview.planId===planId;
  const fechaCorteCalculada=validPreview ? preview.fecha_fin+' (inicia '+preview.fecha_inicio+')' : 'Selecciona cliente y plan';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!clienteSeleccionado || !planSeleccionado) {
      setMensaje('Selecciona un cliente de la lista y un plan válidos.');
      return;
    }

    if(isSubmitting)return;
    setIsSubmitting(true);
    const fingerprint=JSON.stringify([clienteSeleccionado.id_usuario,planSeleccionado.id_plan,planSeleccionado.precio,metodoPago]);
    if(paymentOperation.current?.fingerprint!==fingerprint)paymentOperation.current={fingerprint,key:crypto.randomUUID()};

    try {
      const response = await fetch(`${API_URL}/recepcion/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          idempotency_key: paymentOperation.current.key,
          id_cliente: clienteSeleccionado.id_usuario,
          id_plan: planSeleccionado.id_plan,
          monto: Number(planSeleccionado.precio),
          metodo_pago: metodoPago,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo procesar el pago.');

      setMensaje(`Pago registrado. Nueva vigencia: ${data.membresia.fecha_inicio.slice(0,10)} a ${data.membresia.fecha_fin.slice(0,10)}. Recibo: ${data.pago.num_factura_electronica}`);
      onRegistered?.();
      paymentOperation.current=null;
      setClienteBusqueda('');
      setIdPlan('');
      setMetodoPago('efectivo');
    } catch (submitError) {
      setMensaje(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
        <div className="panel-recep">
          <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Registrar Nuevo Pago</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              
              <div className="input-group" style={{ position: 'relative' }} onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setShowDropdown(false);
              }}>
                <label htmlFor="payment-client">Cliente</label>
                <input
                  id="payment-client"
                  type="text"
                  placeholder="Ej. ED-002 o Ana López"
                  required
                  autoComplete="off"
                  value={clienteBusqueda}
                  onChange={(e) => {
                    setClienteBusqueda(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #1f2d3d', background: '#07111f', color: '#fff' }}
                />
                
                {showDropdown && sugerenciasClientes.length > 0 && (
                  <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0b1626', border: '1px solid #1f2d3d', borderRadius: '6px', marginTop: '5px', padding: 0, listStyle: 'none', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
                    {sugerenciasClientes.map(cliente => (
                      <li key={cliente.id_usuario}><button type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setClienteBusqueda(`ED-${String(cliente.id_usuario).padStart(3, '0')}`);
                          setShowDropdown(false);
                        }}
                        style={{ width: '100%', background: 'transparent', color: 'inherit', border: 0, textAlign: 'left', padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontWeight: 'bold' }}>{cliente.nombre} {cliente.apellido}</span>
                        <span style={{ fontSize: '0.8rem', color: '#00ff88' }}>ED-{String(cliente.id_usuario).padStart(3, '0')}</span>
                      </button></li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="payment-plan">Plan</label>
                <select id="payment-plan" required value={idPlan} onChange={(e) => setIdPlan(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #1f2d3d', background: '#07111f', color: '#fff' }}>
                  <option value="">{loading ? 'Cargando planes...' : 'Seleccione un plan...'}</option>
                  {planes.map((plan) => (
                    <option key={plan.id_plan} value={plan.id_plan}>
                      {plan.nombre_plan} - ${Number(plan.precio).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="payment-method">Método de pago</label>
                <select id="payment-method" required value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #1f2d3d', background: '#07111f', color: '#fff' }}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option><option value="tarjeta">Tarjeta de Crédito / Débito</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="payment-cutoff">Nueva fecha de corte calculada</label>
                <input id="payment-cutoff" type="text" value={fechaCorteCalculada} readOnly disabled style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', color: '#00d4ff' }} />
              </div>
            </div>
            
            <div style={{ marginTop: '30px' }}>
              <button type="submit" className="btn-recep-primary" disabled={isSubmitting || loading || !validPreview}>
                {isSubmitting ? 'Registrando pago...' : 'Registrar pago'}
              </button>
            </div>

            <Notice message={mensaje} type={mensaje.includes('registrado') ? 'success' : 'error'} onClose={() => setMensaje('')} />
          </form>
        </div>
  );
}
