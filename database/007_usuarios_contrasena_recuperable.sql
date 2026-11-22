USE gestor_academico;

ALTER TABLE USUARIOS
  ADD COLUMN contrasena_recuperable VARCHAR(512) NULL AFTER contrasena_hash;
