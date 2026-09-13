-- ==============================================================================
-- BASE DE DATOS: ELDER DRAGÓN FITNESS
-- GESTOR: PostgreSQL
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. MÓDULO DE SEGURIDAD Y USUARIOS
-- ------------------------------------------------------------------------------

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL
);
-- Los 4 roles definidos en la arquitectura
INSERT INTO roles (nombre_rol) VALUES 
('Administrador'), ('Recepcionista'), ('Entrenador'), ('Cliente');

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INT REFERENCES roles(id_rol),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Contraseñas hasheadas (Bcrypt)
    telefono VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'Activo' -- Activo, Inactivo, Moroso
);

-- 20 Registros de Usuarios Reales (1 Admin, 2 Recepcionistas, 3 Entrenadores, 14 Clientes)
INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, telefono, estado) VALUES
(1, 'Nilson Nathan', 'Mejía Ascencio', 'admin@elderdragon.com', 'hash_123', '7000-0001', 'Activo'),
(2, 'Yasmidali Maricela', 'Galdamez Tejada', 'recepcion1@elderdragon.com', 'hash_123', '7000-0002', 'Activo'),
(2, 'Marlon Jonathan', 'Rodríguez Orellana', 'recepcion2@elderdragon.com', 'hash_123', '7000-0003', 'Activo'),
(3, 'Carlos', 'Pérez', 'entrenador.carlos@elderdragon.com', 'hash_123', '7100-0004', 'Activo'),
(3, 'Ana', 'Gómez', 'entrenador.ana@elderdragon.com', 'hash_123', '7100-0005', 'Activo'),
(3, 'Luis', 'Martínez', 'entrenador.luis@elderdragon.com', 'hash_123', '7100-0006', 'Activo'),
(4, 'Jorge', 'López', 'jorge.lopez@gmail.com', 'hash_123', '7200-0007', 'Activo'),
(4, 'María', 'Fernández', 'maria.fer@hotmail.com', 'hash_123', '7200-0008', 'Activo'),
(4, 'Pedro', 'Ramírez', 'pedro.ramirez@yahoo.com', 'hash_123', '7200-0009', 'Moroso'),
(4, 'Sofía', 'Castro', 'sofia.castro@gmail.com', 'hash_123', '7200-0010', 'Activo'),
(4, 'Diego', 'Herrera', 'diego.h@outlook.com', 'hash_123', '7200-0011', 'Inactivo'),
(4, 'Laura', 'Jiménez', 'laura.j@gmail.com', 'hash_123', '7200-0012', 'Activo'),
(4, 'Fernando', 'Vásquez', 'fer.vasquez@gmail.com', 'hash_123', '7200-0013', 'Activo'),
(4, 'Gabriela', 'Rojas', 'gaby.rojas@hotmail.com', 'hash_123', '7200-0014', 'Activo'),
(4, 'Ricardo', 'Méndez', 'ricardo.m@gmail.com', 'hash_123', '7200-0015', 'Moroso'),
(4, 'Daniela', 'Flores', 'dani.flores@yahoo.com', 'hash_123', '7200-0016', 'Activo'),
(4, 'Hugo', 'Morales', 'hugo.morales@gmail.com', 'hash_123', '7200-0017', 'Activo'),
(4, 'Elena', 'Cruz', 'elena.cruz@outlook.com', 'hash_123', '7200-0018', 'Activo'),
(4, 'Andrés', 'Ortiz', 'andres.ortiz@gmail.com', 'hash_123', '7200-0019', 'Activo'),
(4, 'Patricia', 'Reyes', 'patty.reyes@gmail.com', 'hash_123', '7200-0020', 'Inactivo');


-- ------------------------------------------------------------------------------
-- 2. MÓDULO ADMINISTRATIVO Y FINANCIERO
-- ------------------------------------------------------------------------------

CREATE TABLE planes (
    id_plan SERIAL PRIMARY KEY,
    nombre_plan VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    duracion_dias INT NOT NULL
);
-- Catálogo de planes reales de gimnasio
INSERT INTO planes (nombre_plan, precio, duracion_dias) VALUES 
('Pase Diario', 3.00, 1), 
('Quincenal', 15.00, 15), 
('Mensual Estándar', 25.00, 30), 
('Trimestral VIP', 65.00, 90), 
('Anual Premium', 220.00, 365);

CREATE TABLE membresias (
    id_membresia SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES usuarios(id_usuario),
    id_plan INT REFERENCES planes(id_plan),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL -- Activa, Inactiva, Morosa
);

-- 20 Registros de Membresías (Conectando clientes con planes)
INSERT INTO membresias (id_cliente, id_plan, fecha_inicio, fecha_fin, estado) VALUES
(7, 3, '2026-09-01', '2026-10-01', 'Activa'),
(8, 4, '2026-08-15', '2026-11-15', 'Activa'),
(9, 3, '2026-07-10', '2026-08-10', 'Morosa'),
(10, 5, '2026-01-10', '2027-01-10', 'Activa'),
(11, 2, '2026-06-01', '2026-06-15', 'Inactiva'),
(12, 3, '2026-09-05', '2026-10-05', 'Activa'),
(13, 3, '2026-09-02', '2026-10-02', 'Activa'),
(14, 4, '2026-07-20', '2026-10-20', 'Activa'),
(15, 3, '2026-08-01', '2026-09-01', 'Morosa'),
(16, 3, '2026-09-08', '2026-10-08', 'Activa'),
(17, 3, '2026-09-07', '2026-10-07', 'Activa'),
(18, 5, '2026-03-01', '2027-03-01', 'Activa'),
(19, 3, '2026-09-03', '2026-10-03', 'Activa'),
(20, 1, '2026-08-25', '2026-08-26', 'Inactiva'),
(7, 1, '2026-08-28', '2026-08-29', 'Inactiva'), -- Historial antiguo
(12, 3, '2026-08-05', '2026-09-05', 'Inactiva'), -- Historial antiguo
(14, 3, '2026-06-20', '2026-07-20', 'Inactiva'), -- Historial antiguo
(10, 3, '2025-12-10', '2026-01-10', 'Inactiva'), -- Historial antiguo
(19, 3, '2026-08-03', '2026-09-03', 'Inactiva'), -- Historial antiguo
(17, 1, '2026-09-06', '2026-09-07', 'Inactiva'); -- Pase de prueba previo

CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    id_membresia INT REFERENCES membresias(id_membresia),
    id_recepcionista INT REFERENCES usuarios(id_usuario),
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50), -- Efectivo, Tarjeta, Transferencia
    num_factura_electronica VARCHAR(100) UNIQUE
);

-- 20 Registros de Pagos (Automatizando facturación electrónica)
INSERT INTO pagos (id_membresia, id_recepcionista, monto, fecha_pago, metodo_pago, num_factura_electronica) VALUES
(1, 2, 25.00, '2026-09-01 08:30:00', 'Tarjeta', 'FE-EDF-001'),
(2, 3, 65.00, '2026-08-15 14:20:00', 'Transferencia', 'FE-EDF-002'),
(4, 2, 220.00, '2026-01-10 09:15:00', 'Tarjeta', 'FE-EDF-003'),
(5, 3, 15.00, '2026-06-01 18:45:00', 'Efectivo', 'FE-EDF-004'),
(6, 2, 25.00, '2026-09-05 07:10:00', 'Efectivo', 'FE-EDF-005'),
(7, 3, 25.00, '2026-09-02 16:30:00', 'Tarjeta', 'FE-EDF-006'),
(8, 2, 65.00, '2026-07-20 10:05:00', 'Transferencia', 'FE-EDF-007'),
(10, 3, 25.00, '2026-09-08 19:20:00', 'Efectivo', 'FE-EDF-008'),
(11, 2, 25.00, '2026-09-07 06:45:00', 'Tarjeta', 'FE-EDF-009'),
(12, 3, 220.00, '2026-03-01 11:30:00', 'Tarjeta', 'FE-EDF-010'),
(13, 2, 25.00, '2026-09-03 17:50:00', 'Efectivo', 'FE-EDF-011'),
(14, 3, 3.00, '2026-08-25 08:00:00', 'Efectivo', 'FE-EDF-012'),
(15, 2, 3.00, '2026-08-28 15:40:00', 'Efectivo', 'FE-EDF-013'),
(16, 3, 25.00, '2026-08-05 18:10:00', 'Transferencia', 'FE-EDF-014'),
(17, 2, 25.00, '2026-06-20 07:35:00', 'Tarjeta', 'FE-EDF-015'),
(18, 3, 25.00, '2025-12-10 12:25:00', 'Tarjeta', 'FE-EDF-016'),
(19, 2, 25.00, '2026-08-03 19:00:00', 'Efectivo', 'FE-EDF-017'),
(20, 3, 3.00, '2026-09-06 14:15:00', 'Efectivo', 'FE-EDF-018'),
(9, 2, 25.00, '2026-07-10 09:45:00', 'Transferencia', 'FE-EDF-019'), -- Pago vencido que lo dejó moroso
(15, 3, 25.00, '2026-08-01 17:20:00', 'Tarjeta', 'FE-EDF-020'); -- Pago vencido que lo dejó moroso


-- ------------------------------------------------------------------------------
-- 3. MÓDULO DEPORTIVO Y RUTINAS
-- ------------------------------------------------------------------------------

CREATE TABLE ejercicios (
    id_ejercicio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    grupo_muscular VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- 20 Registros de Ejercicios Reales
INSERT INTO ejercicios (nombre, grupo_muscular, descripcion) VALUES
('Press de Banca Plano', 'Pecho', 'Con barra, manos a la anchura de los hombros.'),
('Press Inclinado con Mancuernas', 'Pecho', 'Inclinación de 30-45 grados.'),
('Aperturas en Máquina (Peck Deck)', 'Pecho', 'Contracción lenta y controlada.'),
('Sentadilla Libre con Barra', 'Piernas', 'Bajar hasta romper el paralelo.'),
('Prensa de Piernas', 'Piernas', 'Pies separados a la anchura de los hombros.'),
('Extensiones de Cuádriceps', 'Piernas', 'Aislar el cuádriceps en máquina.'),
('Peso Muerto Convencional', 'Espalda/Piernas', 'Mantener espalda recta y core apretado.'),
('Jalón al Pecho con Polea', 'Espalda', 'Agarre amplio pronado.'),
('Remo con Barra', 'Espalda', 'Inclinación del torso de 45 grados.'),
('Press Militar con Mancuernas', 'Hombros', 'Sentado con respaldo a 90 grados.'),
('Elevaciones Laterales', 'Hombros', 'Subir mancuernas hasta la altura del hombro.'),
('Curl de Bíceps con Barra EZ', 'Brazos', 'Evitar balanceo del torso.'),
('Curl Martillo con Mancuernas', 'Brazos', 'Trabaja el braquial y antebrazo.'),
('Extensión de Tríceps en Polea', 'Brazos', 'Con cuerda, separar al final del movimiento.'),
('Press Francés', 'Brazos', 'Con barra Z recostado en banco.'),
('Crunch Abdominal', 'Core', 'Elevación corta concentrando el abdomen.'),
('Plancha Isométrica', 'Core', 'Mantener postura recta apoyando antebrazos.'),
('Zancadas (Lunges)', 'Piernas', 'Paso hacia adelante alternando piernas.'),
('Hip Thrust (Empuje de Cadera)', 'Glúteos', 'Espalda apoyada en banco, empujar con la cadera.'),
('Dominadas (Pull-ups)', 'Espalda', 'Colgado de la barra, subir hasta pasar la barbilla.');

CREATE TABLE rutinas (
    id_rutina SERIAL PRIMARY KEY,
    id_entrenador INT REFERENCES usuarios(id_usuario),
    id_cliente INT REFERENCES usuarios(id_usuario),
    nombre_rutina VARCHAR(100) NOT NULL,
    fecha_asignacion DATE NOT NULL
);

-- 20 Registros de Rutinas Asignadas
INSERT INTO rutinas (id_entrenador, id_cliente, nombre_rutina, fecha_asignacion) VALUES
(4, 7, 'Hipertrofia Pecho y Tríceps', '2026-09-02'),
(5, 8, 'Fuerza Pierna Completa', '2026-08-16'),
(6, 10, 'Acondicionamiento Full Body', '2026-01-11'),
(4, 12, 'Definición Espalda y Bíceps', '2026-09-06'),
(5, 13, 'Rutina Principiante Día 1', '2026-09-03'),
(6, 14, 'Fuerza Hombros y Core', '2026-07-21'),
(4, 16, 'Hipertrofia Glúteos y Femoral', '2026-09-09'),
(5, 17, 'Rutina Principiante Día 2', '2026-09-08'),
(6, 18, 'Avanzado Pecho y Espalda', '2026-03-02'),
(4, 19, 'Brazos Titan (Bíceps/Tríceps)', '2026-09-04'),
(5, 7, 'Rutina Día 2: Piernas', '2026-09-03'),
(6, 8, 'Fuerza Torso Avanzado', '2026-08-17'),
(4, 12, 'Rutina Día 2: Empujes', '2026-09-07'),
(5, 14, 'Día de Tirones', '2026-07-22'),
(6, 16, 'Activación de Core Avanzada', '2026-09-10'),
(4, 18, 'Fuerza Pierna y Glúteo', '2026-03-03'),
(5, 10, 'Cardio y Resistencia Abdominal', '2026-01-12'),
(6, 13, 'Rutina Principiante Día 3', '2026-09-04'),
(4, 17, 'Acondicionamiento Superior', '2026-09-09'),
(5, 19, 'Hipertrofia Hombros', '2026-09-05');

CREATE TABLE detalle_rutinas (
    id_detalle SERIAL PRIMARY KEY,
    id_rutina INT REFERENCES rutinas(id_rutina),
    id_ejercicio INT REFERENCES ejercicios(id_ejercicio),
    series INT NOT NULL,
    repeticiones INT NOT NULL,
    peso_recomendado_lbs DECIMAL(5,2),
    descanso_segundos INT
);

-- 20 Registros de Detalles de Rutina (Mapeando Ejercicios a Rutinas con sus métricas)
INSERT INTO detalle_rutinas (id_rutina, id_ejercicio, series, repeticiones, peso_recomendado_lbs, descanso_segundos) VALUES
(1, 1, 4, 10, 135.00, 90),  -- Press Banca en Rutina 1
(1, 2, 4, 12, 40.00, 60),   -- Press Inclinado en Rutina 1
(1, 14, 3, 15, 30.00, 45),  -- Extensión Tríceps en Rutina 1
(2, 4, 5, 5, 225.00, 120),  -- Sentadilla en Rutina 2
(2, 5, 4, 10, 315.00, 90),  -- Prensa en Rutina 2
(3, 7, 3, 8, 185.00, 90),   -- Peso Muerto en Rutina 3
(3, 16, 3, 20, 0.00, 30),   -- Crunch Abdominal en Rutina 3
(4, 8, 4, 10, 100.00, 60),  -- Jalón al Pecho en Rutina 4
(4, 12, 4, 12, 50.00, 60),  -- Curl Bíceps en Rutina 4
(5, 6, 3, 15, 40.00, 45),   -- Extensiones Cuádriceps en Rutina 5
(6, 10, 4, 8, 45.00, 90),   -- Press Militar en Rutina 6
(6, 11, 4, 15, 15.00, 45),  -- Elevaciones Laterales en Rutina 6
(7, 19, 4, 12, 135.00, 90), -- Hip Thrust en Rutina 7
(7, 18, 3, 12, 30.00, 60),  -- Zancadas en Rutina 7
(8, 1, 3, 12, 65.00, 60),   -- Press Banca en Rutina 8
(9, 20, 4, 8, 0.00, 90),    -- Dominadas en Rutina 9
(9, 9, 4, 10, 115.00, 90),  -- Remo con Barra en Rutina 9
(10, 15, 4, 10, 60.00, 60), -- Press Francés en Rutina 10
(10, 13, 4, 12, 35.00, 60), -- Curl Martillo en Rutina 10
(11, 4, 4, 8, 185.00, 120); -- Sentadilla en Rutina 11