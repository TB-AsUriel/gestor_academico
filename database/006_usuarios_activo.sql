-- ============================================================
-- 006_usuarios_activo.sql
-- Agrega estado y fecha de creación a los accesos del sistema.
-- ============================================================

USE gestor_academico;
SET NAMES utf8mb4;

ALTER TABLE USUARIOS
  ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER matricula_trabajador,
  ADD COLUMN fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER activo;
