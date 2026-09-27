ALTER TABLE planes VALIDATE CONSTRAINT planes_precio_positivo;
ALTER TABLE planes VALIDATE CONSTRAINT planes_duracion_positiva;
ALTER TABLE pagos VALIDATE CONSTRAINT pagos_monto_positivo;
ALTER TABLE membresias VALIDATE CONSTRAINT membresias_fechas_validas;
ALTER TABLE usuarios VALIDATE CONSTRAINT usuarios_estado_valido;
