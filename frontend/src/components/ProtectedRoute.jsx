import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { api } from '../lib/api';

export default function ProtectedRoute({ roles }) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const location = useLocation();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const sessionKey = `${token}:${location.pathname}`;
  useEffect(() => {
    let active = true;
    if (token) api('/auth/me')
      .then(user => { if (active) setSession({ key: sessionKey, user }); })
      .catch(e => { if(active) setError({ key: sessionKey, message: e.message }); });
    return () => { active = false; };
  }, [token, sessionKey]);
  if (!token) return <Navigate to="/login" replace />;
  if (error?.key === sessionKey) return <main style={{padding:40}}><p role="alert">{error.message}</p><a href="/login">Volver al inicio de sesión</a></main>;
  if (session?.key !== sessionKey) return <p role="status" style={{padding:40}}>Verificando sesión…</p>;
  if (!roles.includes(session.user.rol)) return <main style={{padding:40}}><h1>Acceso restringido</h1><a href="/login">Volver al inicio de sesión</a></main>;
  return <Outlet />;
}
