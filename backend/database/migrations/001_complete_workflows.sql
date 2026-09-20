ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_registro timestamptz;
ALTER TABLE usuarios ALTER COLUMN fecha_registro SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS token_version integer NOT NULL DEFAULT 0;
ALTER TABLE detalle_rutinas ADD COLUMN IF NOT EXISTS repeticiones varchar(50) NOT NULL DEFAULT '';
ALTER TABLE detalle_rutinas ADD COLUMN IF NOT EXISTS descanso_segundos integer NOT NULL DEFAULT 60 CHECK (descanso_segundos >= 0);
UPDATE detalle_rutinas SET repeticiones = split_part(series, 'x', 2), series = split_part(series, 'x', 1)
WHERE series ~ '^[0-9]+x' AND repeticiones = '';
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS idempotency_key uuid UNIQUE;
CREATE INDEX IF NOT EXISTS membresias_cliente_fin_idx ON membresias (id_cliente, fecha_fin DESC);
CREATE TABLE IF NOT EXISTS rutina_asignaciones (
  id_asignacion serial PRIMARY KEY,
  id_cliente integer NOT NULL REFERENCES usuarios(id_usuario),
  id_entrenador integer NOT NULL REFERENCES usuarios(id_usuario),
  id_plantilla integer REFERENCES rutinas(id_rutina) ON DELETE SET NULL,
  nombre varchar(100) NOT NULL,
  detalles jsonb NOT NULL CHECK (jsonb_typeof(detalles) = 'array'),
  fecha_asignacion date NOT NULL DEFAULT CURRENT_DATE,
  notas text NOT NULL DEFAULT '',
  activa boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS asignacion_activa_cliente_idx ON rutina_asignaciones(id_cliente) WHERE activa;
CREATE TABLE IF NOT EXISTS rutina_seguimiento (
  id_seguimiento serial PRIMARY KEY,
  id_asignacion integer NOT NULL REFERENCES rutina_asignaciones(id_asignacion),
  id_autor integer NOT NULL REFERENCES usuarios(id_usuario),
  fecha timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observaciones text NOT NULL,
  completada boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS configuracion (
  id integer PRIMARY KEY CHECK (id = 1),
  datos jsonb NOT NULL,
  actualizado_en timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO configuracion(id, datos) VALUES (1, '{"nombreLegal":"Elder Dragon Fitness","direccion":"","telefono":"","correo":"","moneda":"USD","alertasMorosos":true,"diasAviso":7,"modoMantenimiento":false}') ON CONFLICT DO NOTHING;
