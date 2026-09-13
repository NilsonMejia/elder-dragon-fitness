DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'usuarios'
      AND column_name = 'debe_cambiar_password'
  ) THEN
    ALTER TABLE usuarios
    ADD COLUMN debe_cambiar_password BOOLEAN NOT NULL DEFAULT true;

    UPDATE usuarios
    SET debe_cambiar_password = false;
  END IF;
END $$;
