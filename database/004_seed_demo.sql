-- Seed básico para acceso inicial (esquema diagrama_con_horarios)
USE gestor_academico;
SET NAMES utf8mb4;
-- admin / admin123
INSERT INTO USUARIOS (usuario, contrasena_hash, rol) VALUES
('admin', '$2y$10$fTyK.JKIvyqt6ecgskzmKOcSBz3nGZXgMlDO8ah9n73tHbfb7XdXq', 'Admin')
ON DUPLICATE KEY UPDATE contrasena_hash=VALUES(contrasena_hash), rol=VALUES(rol);
