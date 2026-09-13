import React, { useState } from 'react';
import { AdminPageShell } from './Dashboard';
import '../../css/admin.css';

// =========================================================
// ICONOS SVG
// =========================================================
const Icon = ({ path, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {path}
  </svg>
);

const IconBuilding = (p) => <Icon {...p} path={<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h.01" /><path d="M15 9h.01" /><path d="M9 15h.01" /><path d="M15 15h.01" /></>} />;
const IconPercent  = (p) => <Icon {...p} path={<><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>} />;
const IconBell     = (p) => <Icon {...p} path={<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />;
const IconShield   = (p) => <Icon {...p} path={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} />;
const IconSave     = (p) => <Icon {...p} path={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>} />;
const IconRefresh  = (p) => <Icon {...p} path={<><polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></>} />;
const IconCheck    = (p) => <Icon {...p} path={<polyline points="20 6 9 17 4 12" />} />;
const IconServer   = (p) => <Icon {...p} path={<><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></>} />;
const IconDatabase = (p) => <Icon {...p} path={<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>} />;
const IconLock     = (p) => <Icon {...p} path={<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>} />;

// =========================================================
// TOGGLE COMPONENT
// =========================================================
const Toggle = ({ checked, onChange, label }) => (
  <label className="toggle-row">
    <span className="toggle-label">{label}</span>
    <span className={`toggle ${checked ? 'on' : 'off'}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} hidden />
      <span className="toggle-knob" />
    </span>
  </label>
);

// =========================================================
// COMPONENTE
// =========================================================
const Configuracion = () => {
  // Datos fiscales
  const [fiscales, setFiscales] = useState({
    nombreLegal: 'Elder Dragon Fitness S.A de C.V',
    nit: '0000-000000-000-0',
    direccion: 'Universidad Católica de El Salvador, Santa Ana',
    telefono: '+503 2222-3333',
    correo: 'info@elderdragonfitness.com',
  });

  // Parámetros operativos
  const [operativos, setOperativos] = useState({
    iva: 13,
    moneda: 'USD',
    horaApertura: '05:00',
    horaCierre: '23:00',
    capacidadMax: 120,
  });

  // Sistema (toggles)
  const [sistema, setSistema] = useState({
    notificacionesEmail: true,
    alertasMorosos: true,
    registroAutomatico: false,
    modoMantenimiento: false,
    respaldoDiario: true,
  });

  const handleFiscalChange = (e) => setFiscales({ ...fiscales, [e.target.name]: e.target.value });
  const handleOperativoChange = (e) => setOperativos({ ...operativos, [e.target.name]: e.target.value });
  const handleSistemaChange = (key, value) => setSistema({ ...sistema, [key]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('✅ Configuración guardada correctamente');
  };

  const handleReset = () => {
    if (!window.confirm('¿Restaurar los valores por defecto?')) return;
    setFiscales({
      nombreLegal: 'Elder Dragon Fitness S.A de C.V',
      nit: '0000-000000-000-0',
      direccion: 'Universidad Católica de El Salvador, Santa Ana',
      telefono: '+503 2222-3333',
      correo: 'info@elderdragonfitness.com',
    });
    setOperativos({
      iva: 13, moneda: 'USD', horaApertura: '05:00', horaCierre: '23:00', capacidadMax: 120,
    });
    setSistema({
      notificacionesEmail: true, alertasMorosos: true, registroAutomatico: false,
      modoMantenimiento: false, respaldoDiario: true,
    });
  };

  return (
    <AdminPageShell>
      {/* HEADER */}
      <header className="content-header">
        <div>
          <h1>Configuración</h1>
          <p>Ajustes generales, datos fiscales y parámetros operativos del sistema.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={handleReset}>
            <IconRefresh size={16} /> Restaurar
          </button>
          <button type="button" className="btn-gradient" onClick={handleSubmit}>
            <IconSave size={16} /> Guardar Cambios
          </button>
        </div>
      </header>

      {/* ESTADO DEL SISTEMA */}
      <section className="system-status">
        <div className="status-card online">
          <div className="status-card-icon"><IconServer size={18} /></div>
          <div className="status-card-body">
            <p className="status-label">Servidor</p>
            <p className="status-value">En línea</p>
          </div>
          <span className="status-dot green" />
        </div>
        <div className="status-card online">
          <div className="status-card-icon"><IconDatabase size={18} /></div>
          <div className="status-card-body">
            <p className="status-label">Base de datos</p>
            <p className="status-value">Conectada</p>
          </div>
          <span className="status-dot green" />
        </div>
        <div className="status-card">
          <div className="status-card-icon"><IconShield size={18} /></div>
          <div className="status-card-body">
            <p className="status-label">Último respaldo</p>
            <p className="status-value">Hoy 03:00 AM</p>
          </div>
          <span className="status-dot green" />
        </div>
      </section>

      <form className="config-form" onSubmit={handleSubmit}>

        {/* ============ SECCIÓN 1: DATOS FISCALES ============ */}
        <section className="config-section">
          <div className="config-section-head">
            <div className="config-section-icon"><IconBuilding size={18} /></div>
            <div>
              <h3>Datos Fiscales del Gimnasio</h3>
              <p>Información legal que aparecerá en facturas y documentos oficiales.</p>
            </div>
          </div>

          <div className="config-grid-2">
            <div className="input-group">
              <label>Nombre Legal</label>
              <input
                className="admin-input"
                type="text"
                name="nombreLegal"
                value={fiscales.nombreLegal}
                onChange={handleFiscalChange}
              />
            </div>
            <div className="input-group">
              <label>NIT / NRC</label>
              <input
                className="admin-input"
                type="text"
                name="nit"
                value={fiscales.nit}
                onChange={handleFiscalChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Dirección Sucursal Principal</label>
            <input
              className="admin-input"
              type="text"
              name="direccion"
              value={fiscales.direccion}
              onChange={handleFiscalChange}
            />
          </div>

          <div className="config-grid-2">
            <div className="input-group">
              <label>Teléfono</label>
              <input
                className="admin-input"
                type="text"
                name="telefono"
                value={fiscales.telefono}
                onChange={handleFiscalChange}
              />
            </div>
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input
                className="admin-input"
                type="email"
                name="correo"
                value={fiscales.correo}
                onChange={handleFiscalChange}
              />
            </div>
          </div>
        </section>

        {/* ============ SECCIÓN 2: PARÁMETROS OPERATIVOS ============ */}
        <section className="config-section">
          <div className="config-section-head">
            <div className="config-section-icon"><IconPercent size={18} /></div>
            <div>
              <h3>Parámetros Operativos</h3>
              <p>Configuración de facturación, horarios y capacidad del gimnasio.</p>
            </div>
          </div>

          <div className="config-grid-3">
            <div className="input-group">
              <label>Impuesto IVA (%)</label>
              <input
                className="admin-input"
                type="number"
                name="iva"
                value={operativos.iva}
                onChange={handleOperativoChange}
              />
            </div>
            <div className="input-group">
              <label>Moneda</label>
              <select
                className="admin-input"
                name="moneda"
                value={operativos.moneda}
                onChange={handleOperativoChange}
              >
                <option value="USD">USD — Dólar</option>
                <option value="MXN">MXN — Peso Mexicano</option>
                <option value="GTQ">GTQ — Quetzal</option>
                <option value="HNL">HNL — Lempira</option>
              </select>
            </div>
            <div className="input-group">
              <label>Capacidad Máxima</label>
              <input
                className="admin-input"
                type="number"
                name="capacidadMax"
                value={operativos.capacidadMax}
                onChange={handleOperativoChange}
              />
            </div>
          </div>

          <div className="config-grid-2">
            <div className="input-group">
              <label>Hora de Apertura</label>
              <input
                className="admin-input"
                type="time"
                name="horaApertura"
                value={operativos.horaApertura}
                onChange={handleOperativoChange}
              />
            </div>
            <div className="input-group">
              <label>Hora de Cierre</label>
              <input
                className="admin-input"
                type="time"
                name="horaCierre"
                value={operativos.horaCierre}
                onChange={handleOperativoChange}
              />
            </div>
          </div>
        </section>

        {/* ============ SECCIÓN 3: SISTEMA ============ */}
        <section className="config-section">
          <div className="config-section-head">
            <div className="config-section-icon"><IconBell size={18} /></div>
            <div>
              <h3>Comportamiento del Sistema</h3>
              <p>Activa o desactiva funciones automáticas del panel.</p>
            </div>
          </div>

          <div className="toggles-list">
            <Toggle
              label="Enviar notificaciones por correo"
              checked={sistema.notificacionesEmail}
              onChange={(v) => handleSistemaChange('notificacionesEmail', v)}
            />
            <Toggle
              label="Alertas automáticas de clientes morosos"
              checked={sistema.alertasMorosos}
              onChange={(v) => handleSistemaChange('alertasMorosos', v)}
            />
            <Toggle
              label="Registro automático al ingresar al gimnasio"
              checked={sistema.registroAutomatico}
              onChange={(v) => handleSistemaChange('registroAutomatico', v)}
            />
            <Toggle
              label="Respaldo diario de la base de datos"
              checked={sistema.respaldoDiario}
              onChange={(v) => handleSistemaChange('respaldoDiario', v)}
            />
            <Toggle
              label="Modo mantenimiento (bloquea acceso a clientes)"
              checked={sistema.modoMantenimiento}
              onChange={(v) => handleSistemaChange('modoMantenimiento', v)}
            />
          </div>
        </section>

        {/* ============ SECCIÓN 4: SEGURIDAD ============ */}
        <section className="config-section">
          <div className="config-section-head">
            <div className="config-section-icon"><IconLock size={18} /></div>
            <div>
              <h3>Seguridad</h3>
              <p>Opciones avanzadas de acceso y contraseñas.</p>
            </div>
          </div>

          <div className="config-grid-2">
            <div className="input-group">
              <label>Cambiar contraseña de administrador</label>
              <input className="admin-input" type="password" placeholder="Nueva contraseña" />
            </div>
            <div className="input-group">
              <label>Confirmar contraseña</label>
              <input className="admin-input" type="password" placeholder="Repetir contraseña" />
            </div>
          </div>
        </section>

        {/* ACCIONES FINALES */}
        <div className="config-actions">
          <button type="button" className="btn-outline" onClick={handleReset}>
            <IconRefresh size={16} /> Restaurar
          </button>
          <button type="submit" className="btn-gradient">
            <IconCheck size={16} /> Guardar Cambios
          </button>
        </div>
      </form>
    </AdminPageShell>
  );
};

export default Configuracion;