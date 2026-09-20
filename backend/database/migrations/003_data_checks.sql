ALTER TABLE planes ADD CONSTRAINT planes_precio_positivo CHECK(precio > 0) NOT VALID;
ALTER TABLE planes ADD CONSTRAINT planes_duracion_positiva CHECK(duracion_dias > 0) NOT VALID;
ALTER TABLE pagos ADD CONSTRAINT pagos_monto_positivo CHECK(monto > 0) NOT VALID;
ALTER TABLE membresias ADD CONSTRAINT membresias_fechas_validas CHECK(fecha_fin > fecha_inicio) NOT VALID;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_estado_valido CHECK(estado IN ('Activo','Inactivo','Moroso')) NOT VALID;
