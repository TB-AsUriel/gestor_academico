-- Seed de datos demo para gestor_academico (idempotente)
-- Fuente de materias: planes TecNM 2010, 15 materias compartidas por carrera (3 semestres).
-- Ejecutar: mysql --default-character-set=utf8mb4 -u root gestor_academico < seed_demo_data.sql

SET NAMES utf8mb4;
START TRANSACTION;

-- a) Plan de estudios unico por carrera (arregla el cruce ALUMNOS -> CARRERAS -> RETICULAS)
UPDATE carreras SET plan_estudios = CASE clave_carrera
    WHEN 'IIND'   THEN 'IIND-2010'
    WHEN 'IELEC'  THEN 'IELEC-2010'
    WHEN 'IELCTR' THEN 'IELCTR-2010'
    WHEN 'IMEC'   THEN 'IMEC-2010'
    WHEN 'ITIC'   THEN 'ISIC-2010'
    WHEN 'ILOG'   THEN 'ILOG-2010'
    WHEN 'IGE'    THEN 'IGE-2010'
    WHEN 'LA'     THEN 'LA-2010'
    ELSE plan_estudios END;

-- b) Areas (1 ya existe)
INSERT INTO areas (id_area_rol, nombre_area, poblacion) VALUES
    (2, 'Ing. Industrial', 0),
    (3, 'Ing. Electrica/Electronica', 0),
    (4, 'Ciencias Basicas', 0),
    (5, 'Desarrollo Academico', 0)
ON DUPLICATE KEY UPDATE nombre_area = VALUES(nombre_area);

-- c) Materias compartidas
INSERT INTO materias (clave_materia, nombre_materia, creditos, horas_teoricas, horas_practicas, semestre_recomendado, tipo_materia, clave_materia_recur) VALUES
    (1, 'Fundamentos de Investigacion', 4, 2, 2, 1, 'Cientifica Basica', NULL),
    (2, 'Calculo Diferencial',          5, 3, 2, 1, 'Cientifica Basica', NULL),
    (3, 'Taller de Etica',              4, 0, 4, 1, 'Social Humanistica', NULL),
    (4, 'Fundamentos de Programacion',  5, 2, 3, 1, 'Cientifica Basica', NULL),
    (5, 'Algebra Lineal',               4, 2, 2, 1, 'Cientifica Basica', NULL),
    (6, 'Calculo Integral',             5, 3, 2, 2, 'Cientifica Basica', NULL),
    (7, 'Algebra Superior',             4, 2, 2, 2, 'Cientifica Basica', NULL),
    (8, 'Prog. Orientada a Objetos',    5, 2, 3, 2, 'Cientifica Basica', NULL),
    (9, 'Probabilidad y Estadistica',   5, 3, 2, 2, 'Cientifica Basica', NULL),
    (10, 'Comunicacion Profesional',    4, 2, 2, 2, 'Social Humanistica', NULL),
    (11, 'Ecuaciones Diferenciales',    5, 3, 2, 3, 'Cientifica Basica', NULL),
    (12, 'Metodos Numericos',           5, 3, 2, 3, 'Cientifica Basica', NULL),
    (13, 'Bases de Datos',              5, 2, 3, 3, 'Cientifica Basica', NULL),
    (14, 'Investigacion de Operaciones',5, 3, 2, 3, 'Cientifica Basica', NULL),
    (15, 'Proyecto Integrador',         6, 2, 4, 3, 'Integradora', NULL)
ON DUPLICATE KEY UPDATE
    nombre_materia = VALUES(nombre_materia),
    creditos = VALUES(creditos),
    horas_teoricas = VALUES(horas_teoricas),
    horas_practicas = VALUES(horas_practicas),
    semestre_recomendado = VALUES(semestre_recomendado),
    tipo_materia = VALUES(tipo_materia),
    clave_materia_recur = VALUES(clave_materia_recur);

-- c.1) Seriacion: una materia requiere otra del mismo plan
UPDATE materias
SET clave_materia_recur = CASE clave_materia
    WHEN 6  THEN 2
    WHEN 7  THEN 5
    WHEN 8  THEN 4
    WHEN 9  THEN 2
    WHEN 10 THEN 3
    WHEN 11 THEN 6
    WHEN 12 THEN 11
    WHEN 13 THEN 8
    WHEN 14 THEN 9
    WHEN 15 THEN 10
    ELSE clave_materia_recur END
WHERE clave_materia BETWEEN 6 AND 15;

-- d) reticulas: 15 materias por cada plan de estudios (120 filas)
INSERT INTO reticulas (plan_estudios, semestre, creditos, cadena_materia, clave_materia)
SELECT c.plan_estudios,
       CASE
           WHEN m.clave_materia BETWEEN 1 AND 5  THEN 1
           WHEN m.clave_materia BETWEEN 6 AND 10 THEN 2
           ELSE 3
       END,
       m.creditos,
       CASE
           WHEN m.clave_materia_recur IS NULL THEN 'N/A'
           ELSE CONCAT('MAT-', LPAD(m.clave_materia_recur, 3, '0'))
       END,
       m.clave_materia
FROM carreras c
CROSS JOIN materias m
WHERE m.clave_materia BETWEEN 1 AND 15
  AND NOT EXISTS (
      SELECT 1 FROM reticulas r
      WHERE r.plan_estudios = c.plan_estudios
        AND r.clave_materia = m.clave_materia
  );

-- e) Docentes (1001 y 1002 ya existen)
INSERT INTO docentes (matricula_trabajador, nombre, snombre, apellido_paterno, apellido_materno, genero, fecha_nacimiento) VALUES
    (1003, 'Ana',      NULL,      'Martinez', 'Silva',  'M', '1986-04-18'),
    (1004, 'Luis',     'Alberto', 'Ramirez',  'Ortiz',  'H', '1980-11-02'),
    (1005, 'Patricia', 'Sofia',   'Gomez',    'Vargas', 'M', '1988-09-25')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO datos_personales_docente (matricula_trabajador, correo_institucional, telefono, calle, colonia, no_exterior, no_interior, codigo_postal, municipio, estado) VALUES
    (1003, 'mat003@gestor.edu.mx', '5510001003', 'Campus principal', 'SIN_DATO', NULL, NULL, '00000', 'SIN_DATO', 'SIN_DATO'),
    (1004, 'mat004@gestor.edu.mx', '5510001004', 'Campus principal', 'SIN_DATO', NULL, NULL, '00000', 'SIN_DATO', 'SIN_DATO'),
    (1005, 'mat005@gestor.edu.mx', '5510001005', 'Campus principal', 'SIN_DATO', NULL, NULL, '00000', 'SIN_DATO', 'SIN_DATO')
ON DUPLICATE KEY UPDATE correo_institucional = VALUES(correo_institucional), telefono = VALUES(telefono), calle = VALUES(calle);

INSERT INTO historial_docentes (id_rol, administrativo, docente, fecha_inicio, fecha_fin, estatus, matricula_trabajador)
SELECT 2, 'NO', 'SI', '2026-01-01', NULL, 'ACTIVO', 1003 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM historial_docentes hd WHERE hd.matricula_trabajador = 1003);
INSERT INTO historial_docentes (id_rol, administrativo, docente, fecha_inicio, fecha_fin, estatus, matricula_trabajador)
SELECT 4, 'NO', 'SI', '2026-01-01', NULL, 'ACTIVO', 1004 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM historial_docentes hd WHERE hd.matricula_trabajador = 1004);
INSERT INTO historial_docentes (id_rol, administrativo, docente, fecha_inicio, fecha_fin, estatus, matricula_trabajador)
SELECT 5, 'NO', 'SI', '2026-01-01', NULL, 'ACTIVO', 1005 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM historial_docentes hd WHERE hd.matricula_trabajador = 1005);

-- f) Alumnos (26000001 ya existe en ITIC)
INSERT INTO alumnos (numero_control, nombre, snombre, apellido_paterno, apellido_materno, anio_ingreso, fecha_nacimiento, genero, semestre_actual, creditos_acumulados, estatus, fk_clave_carrera) VALUES
    (26000002, 'Luis',    'Fernando',  'Garcia',     'Mendez', 2026, '2006-02-11', 'H', 1, 0, 'ACTIVO', 'IIND'),
    (26000003, 'Sofia',   NULL,        'Ramirez',    'Torres', 2026, '2006-06-30', 'M', 1, 0, 'ACTIVO', 'IELEC'),
    (26000004, 'Diego',   'Alejandro', 'Hernandez',  'Luna',   2026, '2005-12-05', 'H', 1, 0, 'ACTIVO', 'IMEC'),
    (26000005, 'Valeria', NULL,        'Cruz',       'Santos', 2026, '2006-08-19', 'M', 1, 0, 'ACTIVO', 'ILOG')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO datos_personales_alumno (numero_control, correo_institucional, telefono, calle, colonia, no_exterior, no_interior, codigo_postal, municipio, estado) VALUES
    (26000002, '26000002@gestor.edu.mx', '5510002002', 'Campus principal', 'SIN_DATO', NULL, NULL, '00000', 'SIN_DATO', 'SIN_DATO'),
    (26000003, '26000003@gestor.edu.mx', '5510002003', 'Campus principal', 'SIN_DATO', NULL, NULL, '00000', 'SIN_DATO', 'SIN_DATO'),
    (26000004, '26000004@gestor.edu.mx', '5510002004', 'Campus principal', 'SIN_DATO', NULL, NULL, '00000', 'SIN_DATO', 'SIN_DATO'),
    (26000005, '26000005@gestor.edu.mx', '5510002005', 'Campus principal', 'SIN_DATO', NULL, NULL, '00000', 'SIN_DATO', 'SIN_DATO')
ON DUPLICATE KEY UPDATE correo_institucional = VALUES(correo_institucional), telefono = VALUES(telefono), calle = VALUES(calle);

-- g) Usuarios nuevos reutilizando hashes bcrypt ya verificados
INSERT IGNORE INTO usuarios (usuario, contrasena_hash, rol, numero_control, matricula_trabajador)
SELECT 'mat003@gestor.edu.mx', contrasena_hash, 'Docente', NULL, 1003 FROM usuarios WHERE usuario = 'mat001@gestor.edu.mx';
INSERT IGNORE INTO usuarios (usuario, contrasena_hash, rol, numero_control, matricula_trabajador)
SELECT 'mat004@gestor.edu.mx', contrasena_hash, 'Docente', NULL, 1004 FROM usuarios WHERE usuario = 'mat001@gestor.edu.mx';
INSERT IGNORE INTO usuarios (usuario, contrasena_hash, rol, numero_control, matricula_trabajador)
SELECT 'mat005@gestor.edu.mx', contrasena_hash, 'Docente', NULL, 1005 FROM usuarios WHERE usuario = 'mat001@gestor.edu.mx';
INSERT IGNORE INTO usuarios (usuario, contrasena_hash, rol, numero_control, matricula_trabajador)
SELECT '26000002@gestor.edu.mx', contrasena_hash, 'Alumno', 26000002, NULL FROM usuarios WHERE usuario = '26000001@gestor.edu.mx';
INSERT IGNORE INTO usuarios (usuario, contrasena_hash, rol, numero_control, matricula_trabajador)
SELECT '26000003@gestor.edu.mx', contrasena_hash, 'Alumno', 26000003, NULL FROM usuarios WHERE usuario = '26000001@gestor.edu.mx';
INSERT IGNORE INTO usuarios (usuario, contrasena_hash, rol, numero_control, matricula_trabajador)
SELECT '26000004@gestor.edu.mx', contrasena_hash, 'Alumno', 26000004, NULL FROM usuarios WHERE usuario = '26000001@gestor.edu.mx';
INSERT IGNORE INTO usuarios (usuario, contrasena_hash, rol, numero_control, matricula_trabajador)
SELECT '26000005@gestor.edu.mx', contrasena_hash, 'Alumno', 26000005, NULL FROM usuarios WHERE usuario = '26000001@gestor.edu.mx';

-- h) Grupos (1 por materia/docente)
INSERT INTO grupos (clave_grupo, cupo, no_edificio, clave_materia, matricula_trabajador) VALUES
    (1, 40, 53, 1, 1001),
    (2, 40, 53, 2, 1002),
    (3, 35, 45, 3, 1003),
    (4, 35, 36, 4, 1004),
    (5, 40,  4, 5, 1005),
    (6, 40, 53, 6, 1001)
ON DUPLICATE KEY UPDATE
    cupo = VALUES(cupo),
    no_edificio = VALUES(no_edificio),
    clave_materia = VALUES(clave_materia),
    matricula_trabajador = VALUES(matricula_trabajador);

-- i) Horarios: 2 sesiones semanales por cada inscripcion (30 filas)
INSERT INTO horarios (dia_semana, hora_inicio, hora_fin, salon, matricula_trabajador, numero_control, no_edificio, clave_materia)
SELECT s.dia, s.ini, s.fin, s.salon, g.matricula_trabajador, e.nc, g.no_edificio, g.clave_materia
FROM (
    SELECT 26000001 AS nc, 1 AS grupo UNION ALL
    SELECT 26000002, 1 UNION ALL
    SELECT 26000003, 1 UNION ALL
    SELECT 26000004, 1 UNION ALL
    SELECT 26000005, 1 UNION ALL
    SELECT 26000001, 2 UNION ALL
    SELECT 26000002, 2 UNION ALL
    SELECT 26000003, 2 UNION ALL
    SELECT 26000001, 3 UNION ALL
    SELECT 26000002, 3 UNION ALL
    SELECT 26000005, 3 UNION ALL
    SELECT 26000001, 4 UNION ALL
    SELECT 26000004, 4 UNION ALL
    SELECT 26000001, 5 UNION ALL
    SELECT 26000003, 5 UNION ALL
    SELECT 26000001, 6
) e
JOIN grupos g ON g.clave_grupo = e.grupo
JOIN (
    SELECT 1 AS grupo, 'LUN' AS dia, '07:00:00' AS ini, '08:00:00' AS fin, 'A1' AS salon UNION ALL
    SELECT 1, 'MIE', '07:00:00', '08:00:00', 'A1' UNION ALL
    SELECT 2, 'LUN', '08:00:00', '09:00:00', 'A2' UNION ALL
    SELECT 2, 'MIE', '08:00:00', '09:00:00', 'A2' UNION ALL
    SELECT 3, 'MAR', '07:00:00', '08:00:00', 'B1' UNION ALL
    SELECT 3, 'JUE', '07:00:00', '08:00:00', 'B1' UNION ALL
    SELECT 4, 'MAR', '08:00:00', '09:00:00', 'C1' UNION ALL
    SELECT 4, 'JUE', '08:00:00', '09:00:00', 'C1' UNION ALL
    SELECT 5, 'VIE', '07:00:00', '08:00:00', 'D1' UNION ALL
    SELECT 5, 'VIE', '08:00:00', '09:00:00', 'D1' UNION ALL
    SELECT 6, 'JUE', '09:00:00', '10:00:00', 'A3' UNION ALL
    SELECT 6, 'VIE', '09:00:00', '10:00:00', 'A3'
) s ON s.grupo = g.clave_grupo
WHERE NOT EXISTS (
    SELECT 1 FROM horarios h
    WHERE h.numero_control = e.nc
      AND h.clave_materia = g.clave_materia
      AND h.matricula_trabajador = g.matricula_trabajador
      AND h.dia_semana = s.dia
      AND h.hora_inicio = s.ini
);

-- j) Historial de alumnos (16 inscripciones; 3 en curso, 1 reprobada)
INSERT INTO historial_alumnos (calificacion_ordinaria, calificacion_segunda_oportunidad, calificacion_final, fecha_captura, capturada, numero_control, clave_grupo)
SELECT
    CASE WHEN (e.nc = 26000004 AND e.grupo = 1)
              OR (e.nc = 26000005 AND e.grupo = 3)
              OR (e.nc = 26000001 AND e.grupo = 6) THEN NULL
         WHEN e.nc = 26000001 AND e.grupo = 5 THEN 65
         ELSE 70 + MOD(e.nc + e.grupo * 7, 31) END,
    NULL,
    CASE WHEN (e.nc = 26000004 AND e.grupo = 1)
              OR (e.nc = 26000005 AND e.grupo = 3)
              OR (e.nc = 26000001 AND e.grupo = 6) THEN NULL
         WHEN e.nc = 26000001 AND e.grupo = 5 THEN 65
         ELSE 70 + MOD(e.nc + e.grupo * 7, 31) END,
    CASE WHEN (e.nc = 26000004 AND e.grupo = 1)
              OR (e.nc = 26000005 AND e.grupo = 3)
              OR (e.nc = 26000001 AND e.grupo = 6) THEN NULL
         ELSE '2026-01-20' END,
    CASE WHEN (e.nc = 26000004 AND e.grupo = 1)
              OR (e.nc = 26000005 AND e.grupo = 3)
              OR (e.nc = 26000001 AND e.grupo = 6) THEN 0
         ELSE 1 END,
    e.nc, e.grupo
FROM (
    SELECT 26000001 AS nc, 1 AS grupo UNION ALL
    SELECT 26000002, 1 UNION ALL
    SELECT 26000003, 1 UNION ALL
    SELECT 26000004, 1 UNION ALL
    SELECT 26000005, 1 UNION ALL
    SELECT 26000001, 2 UNION ALL
    SELECT 26000002, 2 UNION ALL
    SELECT 26000003, 2 UNION ALL
    SELECT 26000001, 3 UNION ALL
    SELECT 26000002, 3 UNION ALL
    SELECT 26000005, 3 UNION ALL
    SELECT 26000001, 4 UNION ALL
    SELECT 26000004, 4 UNION ALL
    SELECT 26000001, 5 UNION ALL
    SELECT 26000003, 5 UNION ALL
    SELECT 26000001, 6
) e
WHERE NOT EXISTS (
    SELECT 1 FROM historial_alumnos ha
    WHERE ha.numero_control = e.nc AND ha.clave_grupo = e.grupo
);

-- j.1) Asegura la reprobada demo de 26000001 en Algebra Lineal
UPDATE historial_alumnos
SET calificacion_ordinaria = 65,
    calificacion_final = 65,
    fecha_captura = '2026-01-20',
    capturada = 1
WHERE numero_control = 26000001 AND clave_grupo = 5;

-- k) Kardex derivado de calificaciones capturadas
INSERT INTO kardexs (periodo, avance, numero_control, clave_materia, calificacion_final)
SELECT 'VER', m.creditos, ha.numero_control, g.clave_materia, ha.calificacion_final
FROM historial_alumnos ha
JOIN grupos g ON g.clave_grupo = ha.clave_grupo
JOIN materias m ON m.clave_materia = g.clave_materia
WHERE ha.capturada = 1
  AND ha.calificacion_final IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM kardexs k
      WHERE k.numero_control = ha.numero_control AND k.clave_materia = g.clave_materia
  );

-- k.1) Sincroniza la calificacion reprobada en kardex
UPDATE kardexs
SET calificacion_final = 65
WHERE numero_control = 26000001
  AND clave_materia = 5;

-- l) Creditos acumulados de cada alumno segun materias aprobadas
UPDATE alumnos al
SET al.creditos_acumulados = COALESCE((
    SELECT SUM(m.creditos)
    FROM kardexs k
    JOIN materias m ON m.clave_materia = k.clave_materia
    WHERE k.numero_control = al.numero_control
      AND k.calificacion_final >= 70
), 0);

COMMIT;
