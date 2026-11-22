-- ============================================================
-- 005_migration_horarios.sql (BORRADOR - NO EJECUTAR EN PRODUCCIÓN SIN REVISIÓN)
-- Objetivo: alinear BD `gestor_academico` hacia `diagrama_con_horarios.dia`
-- Basado en: database/001_schema.sql (ER_NUEVO_CORREGIDO) + extracción parcial del diagrama
-- ============================================================
-- PRECONDICIONES:
-- 1) mysqldump --routines --triggers gestor_academico > backup_pre_horarios.sql
-- 2) Ejecutar en entorno de staging/copia y validar conteos y FKs.
-- 3) Completar/ajustar columnas, PK, FK e índices según diagrama confirmado.
-- 4) Resolver ambigüedad HORARIOS (bloques por grupo/salón) vs carga_academica (inscripción alumno-grupo).
-- ============================================================

USE gestor_academico;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- FASE A: Renombres de tablas (nomenclatura del diagrama)
-- NOTA: ajustar orden según dependencias FK reales; puede requerir DROP/ADD FK temporales.
-- ------------------------------------------------------------
-- RENAME TABLE area TO AREAS;
-- RENAME TABLE docente TO DOCENTES;
-- RENAME TABLE historial_docente TO HISTORIAL_DOCENTES;
-- RENAME TABLE carrera TO CARRERAS;
-- RENAME TABLE reticula TO RETICULAS;
-- RENAME TABLE alumno TO ALUMNOS;
-- RENAME TABLE grupo TO GRUPOS;
-- RENAME TABLE historial_alumno TO HISTORIAL_ALUMNOS;
-- RENAME TABLE kardex TO KARDEXS;
-- RENAME TABLE materia TO MATERIAS;
-- RENAME TABLE usuario TO USUARIOS;
-- RENAME TABLE edificio TO EDIFICIOS;
-- -- RENAME TABLE carga_academica TO HORARIOS; -- SOLO si el diagrama confirma equivalencia semántica
-- -- RENAME TABLE horario TO HORARIOS;        -- o esta, según modelo final (conflicto de nombre)

-- ------------------------------------------------------------
-- FASE B: Cambios de columnas detectados (EJEMPLOS, completar según diagrama)
-- ------------------------------------------------------------
-- AREAS: se detectó poblacion NUM(5) NULL y posible matricula_trabajador; confirmar PK/FK.
-- ALTER TABLE AREAS ADD COLUMN poblacion INT NULL, ADD COLUMN matricula_trabajador VARCHAR(15) NULL;

-- DOCENTES: se detectó genero ENUM('H','M'), fecha_nacimiento; revisar paridad con columnas actuales.
-- ALTER TABLE DOCENTES ADD COLUMN genero ENUM('H','M') NULL, ADD COLUMN fecha_nacimiento DATE NULL;

-- MATERIAS: se detectó horas_teoricas, horas_practicas, semestre_recomendado.
-- ALTER TABLE MATERIAS ADD COLUMN horas_teoricas INT NULL, ADD COLUMN horas_practicas INT NULL, ADD COLUMN semestre_recomendado INT NULL;

-- USUARIOS: se detectó usuario, contrasena_hash, rol ENUM('Admin','Docente','Alumno') (vs correo/password_hash/rol actual).
-- ALTER TABLE USUARIOS CHANGE password_hash contrasena_hash VARCHAR(255) NOT NULL;
-- ALTER TABLE USUARIOS CHANGE correo usuario VARCHAR(100) NOT NULL; -- si aplica según diagrama
-- ALTER TABLE USUARIOS MODIFY rol ENUM('Admin','Docente','Alumno') NOT NULL;

-- RETICULAS: diagrama sugiere clave_reticula PK simple (vs PK compuesta plan_estudios+clave_materia).
-- Requiere migración de datos y recreación de PK/FK.
-- ALTER TABLE RETICULAS ADD COLUMN clave_reticula INT NOT NULL AUTO_INCREMENT, DROP PRIMARY KEY, ADD PRIMARY KEY (clave_reticula);

-- HORARIOS (nuevo modelo detectado): id_horario PK, dia_semana ENUM('LUN','MAR','MIE','JUE','VIE','SAB'),
-- hora_inicio TIME, hora_fin TIME, salon VARCHAR(20), matricula_trabajador INT(10) FK?, numero_control INT(10) FK?
-- DISEÑAR tabla final y migrar datos desde `horario` (bloques grupo/salón) y/o `carga_academica` (inscripción).
-- Ejemplo ESQUELETO (NO definitivo):
-- CREATE TABLE HORARIOS_NUEVO (
--   id_horario INT NOT NULL AUTO_INCREMENT,
--   dia_semana ENUM('LUN','MAR','MIE','JUE','VIE','SAB') NOT NULL,
--   hora_inicio TIME NOT NULL,
--   hora_fin TIME NOT NULL,
--   salon VARCHAR(20) NOT NULL,
--   matricula_trabajador VARCHAR(15) NULL,
--   numero_control CHAR(8) NULL,
--   clave_grupo VARCHAR(20) NULL, -- si se conserva vínculo a grupo
--   PRIMARY KEY (id_horario)
-- ) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- FASE C: Datos / mapeos (DEFINIR)
-- ------------------------------------------------------------
-- - Mapear id_dia (1..7) <-> dia_semana ('LUN'..'SAB','DOM'?)
-- - Mapear salon.id_salon/numero_salon <-> HORARIOS.salon (texto)
-- - Mapear carga_academica(numero_control,clave_grupo) y horario(clave_grupo,...) al nuevo modelo HORARIOS
-- - Recalcular/validar kardex, creditos_acumulados y avance tras cambios de claves/tipos

-- ------------------------------------------------------------
-- FASE D: Vistas, triggers y funciones
-- ------------------------------------------------------------
-- Reescribir en base a nombres finales:
--   database/002_views.sql  -> v_alumno_info, v_carga_academica_alumno, v_kardex_alumno,
--     v_docente_carga, v_docente_estatus, v_grupo_detalle, v_reticula_alumno,
--     v_estadistica_calificaciones, v_personal_por_area, v_periodo_activo
--   database/003_triggers.sql -> solapes salón/docente, cupo/solape alumno, cálculo calif/kardex,
--     historial docente vigente, fn_siguiente_numero_control, fn_avance_alumno

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- FIN BORRADOR. Validar en staging antes de cualquier uso en producción.
-- ============================================================
