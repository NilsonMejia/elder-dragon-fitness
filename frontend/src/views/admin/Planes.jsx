import { Notice, useNotifications } from '../../components/Notifications';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageShell } from './Dashboard';
import '../../css/admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Planes = () => {
  const { notify, confirm } = useNotifications();
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('crear'); // 'crear' | 'editar'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    id_plan: null,
    nombre_plan: '',
    precio: '',
    duracion_dias: ''
  });

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const fetchPlanes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/planes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al obtener los planes del servidor.');

      const data = await response.json();
      setPlanes(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con la base de datos para cargar los planes.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loading and error state belong to this API request.
    fetchPlanes();
  }, [token, navigate, fetchPlanes]);

  const openCreateModal = () => {
    setModalMode('crear');
    setFormData({ id_plan: null, nombre_plan: '', precio: '', duracion_dias: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setModalMode('editar');
    setFormData({
      id_plan: plan.id_plan,
      nombre_plan: plan.nombre_plan,
      precio: plan.precio,
      duracion_dias: plan.duracion_dias
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const method = modalMode === 'crear' ? 'POST' : 'PUT';
    const endpoint = modalMode === 'crear' 
      ? `${API_URL}/admin/planes` 
      : `${API_URL}/admin/planes/${formData.id_plan}`;

    const payload = {
      nombre_plan: formData.nombre_plan,
      precio: Number(formData.precio),
      duracion_dias: Number(formData.duracion_dias)
    };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error al guardar el plan.');

      setIsModalOpen(false);
      fetchPlanes();
    } catch (err) {
      console.error(err);
      notify(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // NUEVA FUNCIONALIDAD: ELIMINAR PLAN/OFERTA
  // ==========================================
  const handleDelete = async (id_plan, nombre_plan) => {
    const confirmDelete = await confirm(`¿Estás seguro de que deseas eliminar la oferta "${nombre_plan}"?`, { title: 'Confirmar cambio', confirmLabel: 'Confirmar', danger: true });
    
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/admin/planes/${id_plan}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Captura el error específico del backend si el plan ya tiene clientes asociados
        throw new Error(errorData.message || 'Error al eliminar el plan.');
      }

      notify('Plan eliminado exitosamente.', 'success');
      fetchPlanes(); // Recargar la lista
    } catch (err) {
      console.error(err);
      notify(err.message, 'error');
    }
  };

  const isPremium = (precio, duracion) => Number(precio) >= 50 || Number(duracion) > 60;

  return (
    <AdminPageShell>
      <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h1>Planes de Membresía</h1>
          <p>Configura precios, beneficios y gestiona tus ofertas especiales.</p>
        </div>
        <div className="header-actions">
          <button className="btn-gradient" onClick={openCreateModal}>✨ Nuevo Plan / Oferta</button>
        </div>
      </header>

      <Notice message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#00ff88', gap: '15px' }}>
          <div className="spinner"></div>
          <p>Cargando planes desde PostgreSQL...</p>
        </div>
      ) : (
        <section className="planes-grid">
          {planes.length > 0 ? (
            planes.map((plan) => (
              <article key={plan.id_plan} className={`plan-card ${isPremium(plan.precio, plan.duracion_dias) ? 'premium' : ''}`}>
                <h3>{plan.nombre_plan}</h3>
                <div className="plan-price">${Number(plan.precio).toFixed(2)}</div>
                <p>Duración: {plan.duracion_dias} días</p>
                
                {/* Botones de acción actualizados */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-edit" style={{ flex: 1 }} onClick={() => openEditModal(plan)}>
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn-outline" 
                    style={{ flex: 1, borderColor: 'rgba(255,77,77,0.4)', color: '#ff4d4d' }} 
                    onClick={() => handleDelete(plan.id_plan, plan.nombre_plan)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#8e9ba8' }}>
              No hay planes configurados en el sistema. Haz clic en "+ Nuevo Plan / Oferta" para empezar.
            </div>
          )}
        </section>
      )}

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="panel" style={{ width: '100%', maxWidth: '450px', padding: '30px' }}>
            <h2 style={{ marginBottom: '20px', color: '#fff' }}>
              {modalMode === 'crear' ? '✨ Crear Plan / Oferta' : '✏️ Editar Plan'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="input-group">
                <label>Nombre del Plan (Ej: Promo Verano)</label>
                <input 
                  type="text" className="admin-input" required 
                  value={formData.nombre_plan} 
                  onChange={(e) => setFormData({...formData, nombre_plan: e.target.value})} 
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="input-group">
                  <label>Precio ($)</label>
                  <input 
                    type="number" step="0.01" min="0" className="admin-input" required 
                    value={formData.precio} 
                    onChange={(e) => setFormData({...formData, precio: e.target.value})} 
                  />
                </div>

                <div className="input-group">
                  <label>Duración (Días)</label>
                  <input 
                    type="number" min="1" className="admin-input" required 
                    value={formData.duracion_dias} 
                    onChange={(e) => setFormData({...formData, duracion_dias: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gradient" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
};

export default Planes;