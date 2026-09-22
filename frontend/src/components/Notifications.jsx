/* eslint-disable react-refresh/only-export-components -- Shared notification API and provider. */
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../css/notifications.css';
const NotificationContext = createContext(null);
const titles = { error: 'No se pudo completar', success: 'Listo', info: 'Información' };

export function MiniDialog({ open, title, children, onClose }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    return () => { element.close(); if (previous?.isConnected) previous.focus(); };
  }, [open]);
  if (!open) return null;
  return createPortal(<dialog ref={dialog} className="mini-dialog" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="mini-dialog-header"><h2 id={titleId}>{title}</h2>
      <button type="button" className="notice-close" aria-label="Cerrar ventana" onClick={onClose}>×</button></header>
    {children}
  </dialog>, document.body);
}

export function NotificationProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState(null);
  const pending = useRef(null);
  const sequence = useRef(0);
  const dismiss = useCallback(id => setMessages(items => items.filter(item => item.id !== id)), []);
  const notify = useCallback((message, type = 'info', onClose) => {
    const id = ++sequence.current;
    setMessages(items => [...items, { id, message, type, onClose }]);
    return id;
  }, []);
  const confirm = useCallback((message, options = {}) => new Promise(resolve => {
    pending.current?.(false);
    pending.current = resolve;
    setQuestion({ message, ...options });
  }), []);
  const answer = useCallback(value => {
    pending.current?.(value);
    pending.current = null;
    setQuestion(null);
  }, []);
  useEffect(() => () => { pending.current?.(false); }, []);
  return <NotificationContext.Provider value={{ notify, dismiss, confirm }}>
    {children}
    {createPortal(<section className="notification-stack" aria-label="Notificaciones">
      {messages.map(item => <article key={item.id} className={`notice-card notice-${item.type}`} role={item.type === 'error' ? 'alert' : 'status'}>
        <div><strong>{titles[item.type] || titles.info}</strong><p>{item.message}</p></div>
        <button type="button" className="notice-close" aria-label="Cerrar notificación" onClick={() => { dismiss(item.id); item.onClose?.(); }}>×</button>
      </article>)}
    </section>, document.body)}
    <MiniDialog open={!!question} title={question?.title || 'Confirmar acción'} onClose={() => answer(false)}>
      <p className="mini-dialog-description">{question?.message}</p>
      <footer className="mini-dialog-actions">
        <button type="button" onClick={() => answer(false)}>Cancelar</button>
        <button type="button" className={question?.danger ? 'notice-danger' : 'notice-primary'} onClick={() => answer(true)}>{question?.confirmLabel || 'Confirmar'}</button>
      </footer>
    </MiniDialog>
  </NotificationContext.Provider>;
}
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('Notifications requires NotificationProvider');
  return context;
}
export function Notice({ message, type = 'error', onClose }) {
  const { notify, dismiss } = useNotifications();
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!message) return;
    const id = notify(message, type, () => closeRef.current?.());
    return () => dismiss(id);
  }, [message, type, notify, dismiss]);
  return null;
}
