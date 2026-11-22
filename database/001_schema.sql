-- ============================================================
-- Gestor Académico - Esquema base (MySQL/MariaDB)
-- Actualizado según: diagrama_con_horarios.dia (SQL proporcionado)
-- NOTA: aplicado sobre BD `gestor_academico` para compatibilidad con config actual.
-- ============================================================

DROP DATABASE IF EXISTS gestor_academico;
CREATE DATABASE gestor_academico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestor_academico;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE AREAS (
  id_area_rol   INT          NOT NULL AUTO_INCREMENT,
  nombre_area   VARCHAR(30)  NOT NULL,
  poblacion     SMALLINT     NULL,
  PRIMARY KEY (id_area_rol)
) ENGINE=InnoDB;

CREATE TABLE DOCENTES (
  matricula_trabajador  INT          NOT NULL,
  nombre                VARCHAR(30)  NOT NULL,
  snombre               VARCHAR(30)  NULL,
  apellido_paterno      VARCHAR(30)  NOT NULL,
  apellido_materno      VARCHAR(30)  NOT NULL,
  genero                ENUM('H','M') NOT NULL,
  fecha_nacimiento      DATE         NOT NULL,
  PRIMARY KEY (matricula_trabajador)
) ENGINE=InnoDB;

CREATE TABLE CARRERAS (
  clave_carrera   VARCHAR(30)  NOT NULL,
  nombre_carrera  VARCHAR(30)  NOT NULL,
  plan_estudios   VARCHAR(30)  NULL,
  total_creditos  INT          NOT NULL,
  PRIMARY KEY (clave_carrera)
) ENGINE=InnoDB;

CREATE TABLE EDIFICIOS (
  no_edificio      INT          NOT NULL AUTO_INCREMENT,
  nombre_edificio  VARCHAR(30)  NOT NULL,
  laboratorio      ENUM('SI','NO') NOT NULL,
  salon            ENUM('SI','NO') NOT NULL,
  auditorio        ENUM('SI','NO') NOT NULL,
  capacidad        SMALLINT     NOT NULL,
  PRIMARY KEY (no_edificio),
  UNIQUE KEY uq_edificios_nombre (nombre_edificio)
) ENGINE=InnoDB;

CREATE TABLE MATERIAS (
  clave_materia         INT          NOT NULL AUTO_INCREMENT,
  nombre_materia        VARCHAR(30)  NOT NULL,
  creditos              SMALLINT     NOT NULL,
  horas_teoricas        SMALLINT     NULL,
  horas_practicas       INT          NULL,
  semestre_recomendado  SMALLINT     NULL,
  tipo_materia          VARCHAR(30)  NULL,
  clave_materia_recur   INT          NULL,
  PRIMARY KEY (clave_materia),
  CONSTRAINT fk_materias_recur
    FOREIGN KEY (clave_materia_recur) REFERENCES MATERIAS (clave_materia)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE HISTORIAL_DOCENTES (
  id_historial          INT          NOT NULL AUTO_INCREMENT,
  id_rol                INT          NOT NULL,
  administrativo        ENUM('SI','NO') NOT NULL,
  docente               ENUM('SI','NO') NOT NULL,
  fecha_inicio          DATE         NOT NULL,
  fecha_fin             DATE         NULL,
  estatus               VARCHAR(30)  NULL,
  matricula_trabajador  INT          NOT NULL,
  PRIMARY KEY (id_historial),
  CONSTRAINT fk_histdoc_area
    FOREIGN KEY (id_rol) REFERENCES AREAS (id_area_rol)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_histdoc_docente
    FOREIGN KEY (matricula_trabajador) REFERENCES DOCENTES (matricula_trabajador)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE RETICULAS (
  clave_reticula  INT          NOT NULL AUTO_INCREMENT,
  plan_estudios   VARCHAR(30)  NOT NULL,
  semestre        INT          NOT NULL,
  creditos        INT          NOT NULL,
  cadena_materia  VARCHAR(30)  NOT NULL,
  clave_materia   INT          NOT NULL,
  PRIMARY KEY (clave_reticula),
  CONSTRAINT fk_reticulas_materia
    FOREIGN KEY (clave_materia) REFERENCES MATERIAS (clave_materia)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ALUMNOS (
  numero_control        INT          NOT NULL,
  nombre                VARCHAR(30)  NOT NULL,
  snombre               VARCHAR(30)  NULL,
  apellido_paterno      VARCHAR(30)  NOT NULL,
  apellido_materno      VARCHAR(30)  NULL,
  anio_ingreso          SMALLINT     NOT NULL,
  fecha_nacimiento      DATE         NOT NULL,
  genero                ENUM('H','M') NOT NULL,
  semestre_actual       SMALLINT     NOT NULL,
  creditos_acumulados   SMALLINT     NOT NULL,
  estatus               ENUM('ACTIVO','BAJA','BAJA_EXTRA') NOT NULL,
  fk_clave_carrera      VARCHAR(30)  NOT NULL,
  PRIMARY KEY (numero_control),
  CONSTRAINT fk_alumnos_carrera
    FOREIGN KEY (fk_clave_carrera) REFERENCES CARRERAS (clave_carrera)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE GRUPOS (
  clave_grupo           INT       NOT NULL AUTO_INCREMENT,
  cupo                  SMALLINT  NOT NULL,
  no_edificio           INT       NOT NULL,
  clave_materia         INT       NOT NULL,
  matricula_trabajador  INT       NOT NULL,
  PRIMARY KEY (clave_grupo),
  CONSTRAINT fk_grupos_edificio
    FOREIGN KEY (no_edificio) REFERENCES EDIFICIOS (no_edificio)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_grupos_materia
    FOREIGN KEY (clave_materia) REFERENCES MATERIAS (clave_materia)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_grupos_docente
    FOREIGN KEY (matricula_trabajador) REFERENCES DOCENTES (matricula_trabajador)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE HISTORIAL_ALUMNOS (
  id_calificacion_final             INT           NOT NULL AUTO_INCREMENT,
  calificacion_ordinaria            DECIMAL(5,2)  NULL,
  calificacion_segunda_oportunidad  DECIMAL(5,2)  NULL,
  calificacion_final                DECIMAL(5,2)  NULL,
  fecha_captura                     DATE          NULL,
  capturada                         BOOLEAN       NOT NULL DEFAULT FALSE,
  numero_control                    INT           NOT NULL,
  clave_grupo                       INT           NOT NULL,
  PRIMARY KEY (id_calificacion_final),
  CONSTRAINT fk_histalum_alumno
    FOREIGN KEY (numero_control) REFERENCES ALUMNOS (numero_control)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_histalum_grupo
    FOREIGN KEY (clave_grupo) REFERENCES GRUPOS (clave_grupo)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE KARDEXS (
  ingreso            INT           NOT NULL AUTO_INCREMENT,
  periodo            ENUM('VER','EN-JU','AG-DIC') NOT NULL,
  avance             SMALLINT      NOT NULL,
  numero_control     INT           NOT NULL,
  clave_materia      INT           NOT NULL,
  calificacion_final DECIMAL(5,2)  NOT NULL,
  PRIMARY KEY (ingreso),
  CONSTRAINT fk_kardex_alumno
    FOREIGN KEY (numero_control) REFERENCES ALUMNOS (numero_control)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_kardex_materia
    FOREIGN KEY (clave_materia) REFERENCES MATERIAS (clave_materia)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE USUARIOS (
  id_usuario            INT           NOT NULL AUTO_INCREMENT,
  usuario               VARCHAR(50)   NOT NULL,
  contrasena_hash       VARCHAR(255)  NOT NULL,
  contrasena_recuperable VARCHAR(512) NULL,
  rol                   ENUM('Admin','Docente','Alumno') NOT NULL,
  numero_control        INT           NULL,
  matricula_trabajador  INT           NULL,
  activo                TINYINT(1)    NOT NULL DEFAULT 1,
  fecha_creacion        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_usuario (usuario),
  CONSTRAINT fk_usuarios_alumno
    FOREIGN KEY (numero_control) REFERENCES ALUMNOS (numero_control)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_usuarios_docente
    FOREIGN KEY (matricula_trabajador) REFERENCES DOCENTES (matricula_trabajador)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE datos_personales_alumno (
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

CREATE TABLE datos_personales_docente (
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

CREATE TABLE HORARIOS (
  id_horario            INT          NOT NULL AUTO_INCREMENT,
  dia_semana            ENUM('LUN','MAR','MIE','JUE','VIE','SAB') NOT NULL,
  hora_inicio           TIME         NOT NULL,
  hora_fin              TIME         NOT NULL,
  salon                 VARCHAR(20)  NOT NULL,
  matricula_trabajador  INT          NOT NULL,
  numero_control        INT          NOT NULL,
  no_edificio           INT          NOT NULL,
  clave_materia         INT          NOT NULL,
  PRIMARY KEY (id_horario),
  CONSTRAINT chk_horarios_horas CHECK (hora_fin > hora_inicio),
  CONSTRAINT fk_horarios_docente
    FOREIGN KEY (matricula_trabajador) REFERENCES DOCENTES (matricula_trabajador)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_horarios_alumno
    FOREIGN KEY (numero_control) REFERENCES ALUMNOS (numero_control)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_horarios_edificio
    FOREIGN KEY (no_edificio) REFERENCES EDIFICIOS (no_edificio)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_horarios_materia
    FOREIGN KEY (clave_materia) REFERENCES MATERIAS (clave_materia)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
