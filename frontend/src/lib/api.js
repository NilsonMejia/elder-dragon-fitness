export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export function sessionUser() {
  try { return JSON.parse(localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'null'); }
  catch { return null; }
}
export function logout() {
  for (const storage of [localStorage, sessionStorage]) { storage.removeItem('token'); storage.removeItem('usuario'); }
}
export async function api(path, options = {}) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    if (response.status === 401) { logout(); window.location.assign('/login'); }
    throw new Error(data?.message || 'No se pudo completar la operación.');
  }
  return data;
}
