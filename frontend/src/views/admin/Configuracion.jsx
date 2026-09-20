import { useEffect, useState } from 'react';
import WorkspaceShell from '../../components/WorkspaceShell';
import { api, logout } from '../../lib/api';

export default function Configuracion(){
  const [data,setData]=useState(null),[defaults,setDefaults]=useState(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  const [password,setPassword]=useState({actual:'',nueva:'',confirmacion:''});
  useEffect(()=>{api('/admin/configuracion').then(r=>{setData(r.datos);setDefaults(r.defaults);}).catch(e=>setMessage(e.message));},[]);
  const change=(k,v)=>setData(d=>({...d,[k]:v}));
  async function save(e){e.preventDefault();setBusy(true);try{const r=await api('/admin/configuracion',{method:'PUT',body:data});setData(r.datos);setMessage(r.message);}catch(err){setMessage(err.message);}finally{setBusy(false);}}
  async function changePassword(e){e.preventDefault();if(password.nueva!==password.confirmacion)return setMessage('Las contraseñas no coinciden.');setBusy(true);try{await api('/admin/password',{method:'PUT',body:password});logout();window.location.assign('/login');}catch(err){setMessage(err.message);}finally{setBusy(false);}}
  return <WorkspaceShell><header className="content-header"><h1>Configuración</h1><p>Preferencias guardadas en la base de datos.</p></header>
    {message&&<p role="status">{message}</p>}
    {!data?<p>Cargando configuración…</p>:<>
      <form className="panel workflow-form" onSubmit={save}><h2>Datos del gimnasio</h2>
        {Object.entries({nombreLegal:'Nombre del gimnasio',direccion:'Dirección',telefono:'Teléfono',correo:'Correo'}).map(([k,label])=><label key={k}>{label}<input type={k==='correo'?'email':'text'} maxLength={k==='nombreLegal'?150:250} required={k==='nombreLegal'} value={data[k]} onChange={e=>change(k,e.target.value)}/></label>)}
        <p>Moneda de los planes y pagos: USD.</p>
        <label><input type="checkbox" checked={data.alertasMorosos} onChange={e=>change('alertasMorosos',e.target.checked)}/> Mostrar avisos de vencimiento en administración y recepción</label>
        <label>Días de anticipación<input type="number" min="0" max="60" required value={data.diasAviso} onChange={e=>change('diasAviso',Number(e.target.value))}/></label>
        <label><input type="checkbox" checked={data.modoMantenimiento} onChange={e=>change('modoMantenimiento',e.target.checked)}/> Mantenimiento: suspender temporalmente el acceso del portal del cliente</label>
        <div><button className="btn-gradient" disabled={busy}>Guardar cambios</button> <button type="button" className="btn-outline" onClick={()=>{setData({...defaults});setMessage('Valores restablecidos en el formulario. Guarda para aplicarlos.');}}>Restaurar valores</button></div>
      </form>
      <form className="panel workflow-form" onSubmit={changePassword}><h2>Cambiar mi contraseña</h2>{Object.entries({actual:'Contraseña actual',nueva:'Nueva contraseña',confirmacion:'Confirmar nueva contraseña'}).map(([k,label])=><label key={k}>{label}<input type="password" autoComplete={k==='actual'?'current-password':'new-password'} required minLength={k==='actual'?1:8} maxLength={72} value={password[k]} onChange={e=>setPassword(p=>({...p,[k]:e.target.value}))}/></label>)}<button disabled={busy} className="btn-gradient">Actualizar contraseña y cerrar sesión</button></form>
    </>}
  </WorkspaceShell>;
}
