import React from 'react';
import { AdminPageShell } from './Dashboard';
import '../../css/admin.css';

const rutinas = [
  {
    id: 1,
    nombre: 'Hipertrofia Pecho y Triceps',
    entrenador: 'Carlos Perez',
    cliente: 'Jorge Lopez',
    detalles: ['Press banca 4x10', 'Press inclinado 4x12', 'Extension triceps 3x15'],
  },
  {
    id: 2,
    nombre: 'Fuerza Pierna Completa',
    entrenador: 'Ana Gomez',
    cliente: 'Maria Fernandez',
    detalles: ['Sentadilla 5x5', 'Prensa 4x10', 'Zancadas 3x12'],
  },
  {
    id: 3,
    nombre: 'Acondicionamiento Full Body',
    entrenador: 'Luis Martinez',
    cliente: 'Sofia Castro',
    detalles: ['Peso muerto 3x8', 'Crunch abdominal 3x20', 'Plancha 3x60s'],
  },
];

const Rutinas = () => (
  <AdminPageShell>
    <header className="content-header">
      <div>
        <h1>Rutinas</h1>
        <p>Consulta rutinas asignadas, entrenadores responsables y detalles principales.</p>
      </div>
      <div className="header-actions">
        <button className="btn-gradient">+ Crear Rutina</button>
      </div>
    </header>

    <section className="routine-grid">
      {rutinas.map((rutina) => (
        <article key={rutina.id} className="panel routine-card">
          <h3>{rutina.nombre}</h3>
          <div className="routine-meta">
            <span>Entrenador: {rutina.entrenador}</span>
            <span>Cliente: {rutina.cliente}</span>
          </div>
          <ul className="routine-detail-list">
            {rutina.detalles.map((detalle) => (
              <li key={detalle}>
                <span>{detalle}</span>
                <strong className="text-green">Activo</strong>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  </AdminPageShell>
);

export default Rutinas;
