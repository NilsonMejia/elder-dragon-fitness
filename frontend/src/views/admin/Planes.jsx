import React from 'react';
import { AdminPageShell } from './Dashboard';
import '../../css/admin.css';

const planes = [
  { id: 1, nombre: 'Pase Diario', precio: 3, duracion: 1 },
  { id: 2, nombre: 'Quincenal', precio: 15, duracion: 15 },
  { id: 3, nombre: 'Mensual Estandar', precio: 25, duracion: 30 },
  { id: 4, nombre: 'Trimestral VIP', precio: 65, duracion: 90, premium: true },
  { id: 5, nombre: 'Anual Premium', precio: 220, duracion: 365, premium: true },
];

const Planes = () => (
  <AdminPageShell>
    <header className="content-header">
      <div>
        <h1>Planes de Membresia</h1>
        <p>Configura precios, beneficios y duracion de cada acceso.</p>
      </div>
      <div className="header-actions">
        <button className="btn-gradient">+ Crear Plan</button>
      </div>
    </header>

    <section className="planes-grid">
      {planes.map((plan) => (
        <article key={plan.id} className={`plan-card ${plan.premium ? 'premium' : ''}`}>
          <h3>{plan.nombre}</h3>
          <div className="plan-price">${plan.precio.toFixed(2)}</div>
          <p>Duracion: {plan.duracion} dias</p>
          <button className="btn-edit-full">Modificar Precio</button>
        </article>
      ))}
    </section>
  </AdminPageShell>
);

export default Planes;
