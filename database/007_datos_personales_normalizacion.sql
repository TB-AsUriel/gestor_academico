-- ============================================================
-- 007_datos_personales_normalizacion.sql
-- Normaliza datos personales de alumnos y docentes (1FN/2FN).
-- Mueve correo, telefono y direccion a tablas dedicadas y
-- descompone direccion en campos atomicos.
-- ============================================================
USE gestor_academico;

START TRANSACTION;

CREATE TABLE IF NOT EXISTS datos_personales_alumno (
  numero_control       INT          NOT NULL,
  correo_institucional VARCHAR(30)  NOT NULL,
  telefono             VARCHAR(15)  NOT NULL,
  calle                VARCHAR(60)  NOT NULL,
  colonia              VARCHAR(60)  NOT NULL,
  no_exterior          VARCHAR(10)  NULL,
  no_interior          VARCHAR(10)  NULL,
  codigo_postal        CHAR(5)      NOT NULL,
  municipio            VARCHAR(60)  NOT NULL,
  estado               VARCHAR(40)  NOT NULL,
  PRIMARY KEY (numero_control),
  UNIQUE KEY uq_dpa_correo (correo_institucional),
  CONSTRAINT fk_dpa_alumno FOREIGN KEY (numero_control)
    REFERENCES ALUMNOS (numero_control)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS datos_personales_docente (
  matricula_trabajador INT          NOT NULL,
  correo_institucional VARCHAR(30)  NOT NULL,
  telefono             VARCHAR(30)  NOT NULL,
  calle                VARCHAR(60)  NOT NULL,
  colonia              VARCHAR(60)  NOT NULL,
  no_exterior          VARCHAR(10)  NULL,
  no_interior          VARCHAR(10)  NULL,
  codigo_postal        CHAR(5)      NOT NULL,
  municipio            VARCHAR(60)  NOT NULL,
  estado               VARCHAR(40)  NOT NULL,
  PRIMARY KEY (matricula_trabajador),
  UNIQUE KEY uq_dpd_correo (correo_institucional),
  CONSTRAINT fk_dpd_docente FOREIGN KEY (matricula_trabajador)
    REFERENCES DOCENTES (matricula_trabajador)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO datos_personales_alumno (
  numero_control, correo_institucional, telefono, calle, colonia,
  no_exterior, no_interior, codigo_postal, municipio, estado
)
SELECT
  a.numero_control,
  a.correo_institucional,
  a.telefono,
  LEFT(COALESCE(NULLIF(TRIM(a.direccion), ''), 'SIN_DATO'), 60),
  'SIN_DATO',
  NULL,
  NULL,
  '00000',
  'SIN_DATO',
  'SIN_DATO'
FROM ALUMNOS a
ON DUPLICATE KEY UPDATE
  correo_institucional = VALUES(correo_institucional),
  telefono = VALUES(telefono),
  calle = VALUES(calle),
  colonia = VALUES(colonia),
  codigo_postal = VALUES(codigo_postal),
  municipio = VALUES(municipio),
  estado = VALUES(estado);

INSERT INTO datos_personales_docente (
  matricula_trabajador, correo_institucional, telefono, calle, colonia,
  no_exterior, no_interior, codigo_postal, municipio, estado
)
SELECT
  d.matricula_trabajador,
  d.correo_institucional,
  d.telefono,
  LEFT(COALESCE(NULLIF(TRIM(d.direccion), ''), 'SIN_DATO'), 60),
  'SIN_DATO',
  NULL,
  NULL,
  '00000',
  'SIN_DATO',
  'SIN_DATO'
FROM DOCENTES d
ON DUPLICATE KEY UPDATE
  correo_institucional = VALUES(correo_institucional),
  telefono = VALUES(telefono),
  calle = VALUES(calle),
  colonia = VALUES(colonia),
  codigo_postal = VALUES(codigo_postal),
  municipio = VALUES(municipio),
  estado = VALUES(estado);

ALTER TABLE ALUMNOS DROP INDEX uq_alumnos_correo;
ALTER TABLE ALUMNOS
  DROP COLUMN correo_institucional,
  DROP COLUMN telefono,
  DROP COLUMN direccion;

ALTER TABLE DOCENTES DROP INDEX uq_docentes_correo;
ALTER TABLE DOCENTES DROP INDEX uq_docentes_telefono;
ALTER TABLE DOCENTES
  DROP COLUMN correo_institucional,
  DROP COLUMN telefono,
  DROP COLUMN direccion;

COMMIT;
