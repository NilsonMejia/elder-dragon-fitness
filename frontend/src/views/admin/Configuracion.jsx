import React, { useEffect, useState, useCallback } from 'react';
import { Notice, useNotifications } from '../../components/Notifications';
import WorkspaceShell from '../../components/WorkspaceShell';
import { api, logout } from '../../lib/api';

export default function Configuracion() {
  const { notify, confirm } = useNotifications();
  const [data, setData] = useState(null);
  const [defaults, setDefaults] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [busy, setBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [password, setPassword] = useState({ actual: '', nueva: '', confirmacion: '' });
  const [passwordError, setPasswordError] = useState('');

  const fetchConfig = useCallback(async () => {
    try {
      const r = await api('/admin/configuracion');
      setData(r.datos);
      setDefaults(r.defaults);
    } catch (e) {
      setMessageType('error');
      setMessage(e.message || 'Error al cargar la configuración.');
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  async function save(e) {
    e.preventDefault();
    if (!data.nombreLegal?.trim()) {
      setMessageType('error');
      setMessage('El nombre del gimnasio es obligatorio.');
      notify('El nombre del gimnasio es obligatorio.', 'error');
      return;
    }

    setBusy(true);
    try {
      const r = await api('/admin/configuracion', { method: 'PUT', body: data });
      setData(r.datos);
      setMessageType('success');
      setMessage(r.message || 'Configuración guardada.');
      notify(r.message || 'Configuración guardada.', 'success');
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    const ok = await confirm('¿Deseas restaurar los valores predeterminados del sistema?', {
      title: 'Restaurar configuración',
      confirmLabel: 'Restaurar',
      danger: false
    });
    if (!ok) return;

    setData({ ...defaults });
    setMessageType('info');
    setMessage('Valores restablecidos en el formulario. Guarda para aplicarlos.');
    notify('Valores restablecidos. Haz clic en "Guardar cambios" para aplicarlos.', 'info');
  }

  async function changePassword(e) {
    e.preventDefault();
    setPasswordError('');

    if (password.nueva.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      notify('La nueva contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }

    if (password.nueva !== password.confirmacion) {
      setPasswordError('Las contraseñas no coinciden.');
      setMessageType('error');
      setMessage('Las contraseñas no coinciden.');
      notify('Las contraseñas no coinciden.', 'error');
      return;
    }

    setPasswordBusy(true);
    try {
      await api('/admin/password', { method: 'PUT', body: password });
      notify('Contraseña actualizada. Cerrando sesión...', 'success');
      setTimeout(() => {
        logout();
        window.location.assign('/login');
      }, 1000);
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
      notify(err.message, 'error');
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <WorkspaceShell>
      <header className="content-header" style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 6px 0', color: '#fff' }}>Configuración</h1>
        <p style={{ color: 'var(--admin-muted)', margin: 0 }}>
          Preferencias institucionales, avisos de morosidad y seguridad del sistema.
        </p>
      </header>

      <Notice message={message} type={messageType} onClose={() => setMessage('')} />

      {!data ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#00ff88' }}>
          <p>Cargando configuración…</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px', alignItems: 'start' }}>
          {/* Panel de Datos del Gimnasio y Políticas */}
          <form className="panel workflow-form" onSubmit={save} style={{ background: '#10161e', borderRadius: '18px', padding: '30px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '12px' }}>
              Datos del gimnasio
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'block', color: 'var(--admin-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                Nombre del gimnasio
                <input
                  type="text"
                  maxLength={150}
                  required
                  value={data.nombreLegal || ''}
                  onChange={(e) => change('nombreLegal', e.target.value)}
                  style={{ width: '100%', marginTop: '6px', background: '#070b10', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }}
                />
              </label>

              <label style={{ display: 'block', color: 'var(--admin-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                Dirección
                <input
                  type="text"
                  maxLength={250}
                  value={data.direccion || ''}
                  onChange={(e) => change('direccion', e.target.value)}
                  style={{ width: '100%', marginTop: '6px', background: '#070b10', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'block', color: 'var(--admin-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Teléfono
                  <input
                    type="text"
                    maxLength={250}
                    value={data.telefono || ''}
                    onChange={(e) => change('telefono', e.target.value)}
                    style={{ width: '100%', marginTop: '6px', background: '#070b10', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </label>

                <label style={{ display: 'block', color: 'var(--admin-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Correo
                  <input
                    type="email"
                    maxLength={250}
                    value={data.correo || ''}
                    onChange={(e) => change('correo', e.target.value)}
                    style={{ width: '100%', marginTop: '6px', background: '#070b10', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </label>
              </div>

              <div style={{ padding: '12px 16px', background: 'rgba(0, 212, 255, 0.05)', borderRadius: '10px', border: '1px solid rgba(0, 212, 255, 0.15)', color: '#00d4ff', fontSize: '0.85rem' }}>
                Moneda de los planes y pagos: <strong>USD</strong>.
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#eef7f1', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={data.alertasMorosos || false}
                    onChange={(e) => change('alertasMorosos', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#00ff88', marginTop: '2px', cursor: 'pointer' }}
                  />
                  <span>Mostrar avisos de vencimiento en administración, recepción y la cuenta del cliente</span>
                </label>

                <label style={{ display: 'block', color: 'var(--admin-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Días de anticipación
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={data.diasAviso ?? 7}
                    onChange={(e) => change('diasAviso', Number(e.target.value))}
                    style={{ width: '100%', marginTop: '6px', background: '#070b10', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#ffb3b3', fontSize: '0.9rem', cursor: 'pointer', background: 'rgba(255, 77, 77, 0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                  <input
                    type="checkbox"
                    checked={data.modoMantenimiento || false}
                    onChange={(e) => change('modoMantenimiento', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#ff4d4d', marginTop: '2px', cursor: 'pointer' }}
                  />
                  <span>Mantenimiento: suspender temporalmente el acceso del portal del cliente</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn-gradient"
                  disabled={busy}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: 'linear-gradient(90deg, #51ffaa, #00d4ff)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#05080c',
                    fontWeight: '800',
                    fontSize: '0.92rem',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 255, 136, 0.25)'
                  }}
                >
                  {busy ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={handleReset}
                  style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: '#8e9ba8',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#8e9ba8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                >
                  Restaurar valores
                </button>
              </div>
            </div>
          </form>

          {/* Panel de Cambio de Contraseña */}
          <form className="panel workflow-form" onSubmit={changePassword} style={{ background: '#10161e', borderRadius: '18px', padding: '30px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '12px' }}>
              Cambiar mi contraseña
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <label style={{ display: 'block', color: 'var(--admin-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                Contraseña actual
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={1}
                  maxLength={72}
                  value={password.actual}
                  onChange={(e) => setPassword((p) => ({ ...p, actual: e.target.value }))}
                  style={{ width: '100%', marginTop: '6px', background: '#070b10', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }}
                />
              </label>

              <label style={{ display: 'block', color: 'var(--admin-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                Nueva contraseña
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  value={password.nueva}
                  onChange={(e) => setPassword((p) => ({ ...p, nueva: e.target.value }))}
                  style={{ width: '100%', marginTop: '6px', background: '#070b10', border: passwordError ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }}
                />
              </label>

              <label style={{ display: 'block', color: 'var(--admin-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                Confirmar nueva contraseña
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  value={password.confirmacion}
                  onChange={(e) => setPassword((p) => ({ ...p, confirmacion: e.target.value }))}
                  style={{ width: '100%', marginTop: '6px', background: '#070b10', border: passwordError ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }}
                />
              </label>

              {passwordError && (
                <div style={{ color: '#ff4d4d', fontSize: '0.82rem', padding: '8px 12px', background: 'rgba(255,77,77,0.1)', borderRadius: '8px', border: '1px solid rgba(255,77,77,0.3)' }}>
                  ⚠️ {passwordError}
                </div>
              )}

              <p style={{ color: '#8e9ba8', fontSize: '0.82rem', margin: 0 }}>
                ℹ️ Al cambiar tu contraseña, tu sesión actual se cerrará por seguridad y deberás ingresar con tus nuevas credenciales.
              </p>

              <button
                type="submit"
                disabled={passwordBusy}
                className="btn-gradient"
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '12px 20px',
                  background: 'linear-gradient(90deg, #ff6b6b, #ff8e53)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  cursor: passwordBusy ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.25)'
                }}
              >
                {passwordBusy ? 'Actualizando...' : 'Actualizar contraseña y cerrar sesión'}
              </button>
            </div>
          </form>
        </div>
      )}
    </WorkspaceShell>
  );
}
