USE gestor_academico;

START TRANSACTION;

-- Plantel (obligatorio para alumno.numero_control)
INSERT INTO plantel (clave_plantel, nombre_plantel, ubicacion)
VALUES ('01', 'Plantel Central', 'Ciudad')
ON DUPLICATE KEY UPDATE
  nombre_plantel = VALUES(nombre_plantel),
  ubicacion = VALUES(ubicacion);

-- Catalogo area
INSERT INTO area (nombre_area, descripcion)
VALUES ('Tecnologías de la Información', 'Docencia e investigación en tecnologías de la información')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

SET @id_area = (
  SELECT id_area FROM area
  WHERE nombre_area = 'Tecnologías de la Información'
  LIMIT 1
);

-- Carrera
INSERT INTO carrera (clave_carrera, nombre_carrera, total_creditos, duracion_semestres)
VALUES ('ISC', 'Ingeniería en Sistemas Computacionales', 240, 9)
ON DUPLICATE KEY UPDATE
  nombre_carrera = VALUES(nombre_carrera),
  total_creditos = VALUES(total_creditos),
  duracion_semestres = VALUES(duracion_semestres);

-- Plan de estudios
INSERT INTO plan_estudios (clave_carrera, nombre_plan, fecha_inicio, fecha_fin, activo)
SELECT 'ISC', 'ISC-2024', '2024-08-01', NULL, 1
WHERE NOT EXISTS (
  SELECT 1 FROM plan_estudios
  WHERE clave_carrera = 'ISC' AND nombre_plan = 'ISC-2024'
);

SET @id_plan = (
  SELECT id_plan FROM plan_estudios
  WHERE clave_carrera = 'ISC' AND nombre_plan = 'ISC-2024'
  ORDER BY id_plan
  LIMIT 1
);

-- Periodo activo
INSERT INTO periodo (clave_periodo, nombre_periodo, fecha_inicio, fecha_fin, activo)
VALUES ('2026-2', 'Agosto-Diciembre 2026', '2026-08-03', '2026-12-18', 1)
ON DUPLICATE KEY UPDATE
  nombre_periodo = VALUES(nombre_periodo),
  fecha_inicio = VALUES(fecha_inicio),
  fecha_fin = VALUES(fecha_fin),
  activo = VALUES(activo);

SET @id_periodo = (
  SELECT id_periodo FROM periodo WHERE clave_periodo = '2026-2' LIMIT 1
);

-- Aula
INSERT INTO aula (edificio, numero_aula, capacidad, tipo_aula)
VALUES ('A', '101', 40, 'AULA')
ON DUPLICATE KEY UPDATE
  capacidad = VALUES(capacidad),
  tipo_aula = VALUES(tipo_aula);

SET @id_aula = (
  SELECT id_aula FROM aula
  WHERE edificio = 'A' AND numero_aula = '101'
  LIMIT 1
);

-- Materias
INSERT INTO materia (clave_materia, nombre_materia, creditos, horas_teoricas, horas_practicas, tipo_materia)
VALUES
  ('ISC101', 'Fundamentos de Programación', 8, 3, 2, 'OBLIGATORIA'),
  ('ISC102', 'Matemáticas Discretas', 8, 3, 2, 'OBLIGATORIA')
ON DUPLICATE KEY UPDATE
  nombre_materia = VALUES(nombre_materia),
  creditos = VALUES(creditos),
  horas_teoricas = VALUES(horas_teoricas),
  horas_practicas = VALUES(horas_practicas),
  tipo_materia = VALUES(tipo_materia);

-- Docente
INSERT INTO docente (
  matricula_trabajador, nombre, apellido_paterno, apellido_materno,
  genero, fecha_nacimiento, correo_institucional, telefono,
  id_area, id_tipo_docente
)
VALUES (
  'D26001', 'Juan', 'Pérez', 'López',
  'M', '1985-03-15', 'docente@universidad.edu.mx', '555-0101',
  @id_area,
  (SELECT id_tipo_docente FROM tipo_docente WHERE nombre_tipo = 'PLAZA')
)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  apellido_paterno = VALUES(apellido_paterno),
  apellido_materno = VALUES(apellido_materno),
  genero = VALUES(genero),
  fecha_nacimiento = VALUES(fecha_nacimiento),
  correo_institucional = VALUES(correo_institucional),
  telefono = VALUES(telefono),
  id_area = VALUES(id_area),
  id_tipo_docente = VALUES(id_tipo_docente);

SET @id_docente = (
  SELECT id_docente FROM docente WHERE matricula_trabajador = 'D26001' LIMIT 1
);

-- Usuario docente (password: docente123)
INSERT INTO usuario (correo, password_hash, id_rol, id_docente, numero_control, activo)
VALUES (
  'docente@universidad.edu.mx',
  '$2y$10$OUOF/f1opyWv7dE2u/slFe74dW2VVTmfxe5F1KVa1lLwNB78WDwnG',
  (SELECT id_rol FROM rol WHERE nombre_rol = 'DOCENTE'),
  @id_docente,
  NULL,
  1
)
ON DUPLICATE KEY UPDATE
  correo = VALUES(correo),
  password_hash = VALUES(password_hash),
  id_rol = VALUES(id_rol),
  id_docente = VALUES(id_docente),
  numero_control = NULL,
  activo = 1;

-- Alumno
INSERT INTO alumno (
  numero_control, anio_ingreso, clave_plantel, consecutivo, id_plan,
  nombre, apellido_paterno, apellido_materno, fecha_nacimiento, genero,
  correo_institucional, semestre_actual, id_estatus
)
VALUES (
  '26010001', 2026, '01', 1, @id_plan,
  'María', 'García', 'Hernández', '2006-05-14', 'F',
  'alumno@universidad.edu.mx', 1,
  (SELECT id_estatus FROM estatus_alumno WHERE nombre_estatus = 'ACTIVO')
)
ON DUPLICATE KEY UPDATE
  anio_ingreso = VALUES(anio_ingreso),
  clave_plantel = VALUES(clave_plantel),
  consecutivo = VALUES(consecutivo),
  id_plan = VALUES(id_plan),
  nombre = VALUES(nombre),
  apellido_paterno = VALUES(apellido_paterno),
  apellido_materno = VALUES(apellido_materno),
  fecha_nacimiento = VALUES(fecha_nacimiento),
  genero = VALUES(genero),
  correo_institucional = VALUES(correo_institucional),
  semestre_actual = VALUES(semestre_actual),
  id_estatus = VALUES(id_estatus);

-- Usuario alumno (password: alumno123)
INSERT INTO usuario (correo, password_hash, id_rol, id_docente, numero_control, activo)
VALUES (
  'alumno@universidad.edu.mx',
  '$2y$10$3ug9fuLncY3gWKix6EWMNuAIxI3H1nHdUmmaVdi4LMhmyKxEWT5Aa',
  (SELECT id_rol FROM rol WHERE nombre_rol = 'ALUMNO'),
  NULL,
  '26010001',
  1
)
ON DUPLICATE KEY UPDATE
  correo = VALUES(correo),
  password_hash = VALUES(password_hash),
  id_rol = VALUES(id_rol),
  id_docente = NULL,
  numero_control = VALUES(numero_control),
  activo = 1;

-- Grupo
INSERT INTO grupo (clave_grupo, id_periodo, id_plan, semestre, turno, cupo)
VALUES ('ISC-1A', @id_periodo, @id_plan, 1, 'MATUTINO', 30)
ON DUPLICATE KEY UPDATE
  semestre = VALUES(semestre),
  turno = VALUES(turno),
  cupo = VALUES(cupo);

SET @id_grupo = (
  SELECT id_grupo FROM grupo
  WHERE clave_grupo = 'ISC-1A' AND id_periodo = @id_periodo AND id_plan = @id_plan
  LIMIT 1
);

-- Materias del grupo
INSERT INTO grupo_materia (id_grupo, clave_materia)
VALUES (@id_grupo, 'ISC101')
ON DUPLICATE KEY UPDATE id_grupo = VALUES(id_grupo);

INSERT INTO grupo_materia (id_grupo, clave_materia)
VALUES (@id_grupo, 'ISC102')
ON DUPLICATE KEY UPDATE id_grupo = VALUES(id_grupo);

SET @id_gm_isc101 = (
  SELECT id_grupo_materia FROM grupo_materia
  WHERE id_grupo = @id_grupo AND clave_materia = 'ISC101'
  LIMIT 1
);

SET @id_gm_isc102 = (
  SELECT id_grupo_materia FROM grupo_materia
  WHERE id_grupo = @id_grupo AND clave_materia = 'ISC102'
  LIMIT 1
);

-- Asignaciones docentes
INSERT INTO asignacion_docente (id_docente, id_grupo_materia, fecha_inicio, fecha_fin)
VALUES (@id_docente, @id_gm_isc101, '2026-08-03', '2026-12-18')
ON DUPLICATE KEY UPDATE
  fecha_inicio = VALUES(fecha_inicio),
  fecha_fin = VALUES(fecha_fin);

INSERT INTO asignacion_docente (id_docente, id_grupo_materia, fecha_inicio, fecha_fin)
VALUES (@id_docente, @id_gm_isc102, '2026-08-03', '2026-12-18')
ON DUPLICATE KEY UPDATE
  fecha_inicio = VALUES(fecha_inicio),
  fecha_fin = VALUES(fecha_fin);

SET @id_asig_isc101 = (
  SELECT id_asignacion FROM asignacion_docente
  WHERE id_docente = @id_docente AND id_grupo_materia = @id_gm_isc101
  LIMIT 1
);

SET @id_asig_isc102 = (
  SELECT id_asignacion FROM asignacion_docente
  WHERE id_docente = @id_docente AND id_grupo_materia = @id_gm_isc102
  LIMIT 1
);

-- Horario: ISC101 lunes y miércoles 07:00-09:00
INSERT INTO horario (id_asignacion, id_periodo, id_dia, id_aula, hora_inicio, hora_fin)
SELECT @id_asig_isc101, @id_periodo, 1, @id_aula, '07:00:00', '09:00:00'
WHERE NOT EXISTS (
  SELECT 1 FROM horario
  WHERE id_asignacion = @id_asig_isc101 AND id_dia = 1 AND hora_inicio = '07:00:00'
);

INSERT INTO horario (id_asignacion, id_periodo, id_dia, id_aula, hora_inicio, hora_fin)
SELECT @id_asig_isc101, @id_periodo, 3, @id_aula, '07:00:00', '09:00:00'
WHERE NOT EXISTS (
  SELECT 1 FROM horario
  WHERE id_asignacion = @id_asig_isc101 AND id_dia = 3 AND hora_inicio = '07:00:00'
);

-- Horario: ISC102 martes y jueves 09:00-11:00
INSERT INTO horario (id_asignacion, id_periodo, id_dia, id_aula, hora_inicio, hora_fin)
SELECT @id_asig_isc102, @id_periodo, 2, @id_aula, '09:00:00', '11:00:00'
WHERE NOT EXISTS (
  SELECT 1 FROM horario
  WHERE id_asignacion = @id_asig_isc102 AND id_dia = 2 AND hora_inicio = '09:00:00'
);

INSERT INTO horario (id_asignacion, id_periodo, id_dia, id_aula, hora_inicio, hora_fin)
SELECT @id_asig_isc102, @id_periodo, 4, @id_aula, '09:00:00', '11:00:00'
WHERE NOT EXISTS (
  SELECT 1 FROM horario
  WHERE id_asignacion = @id_asig_isc102 AND id_dia = 4 AND hora_inicio = '09:00:00'
);

-- Inscripciones activas
INSERT INTO inscripcion (numero_control, id_grupo_materia, fecha_inscripcion, estatus)
VALUES ('26010001', @id_gm_isc101, CURDATE(), 'ACTIVO')
ON DUPLICATE KEY UPDATE
  fecha_inscripcion = VALUES(fecha_inscripcion),
  estatus = VALUES(estatus);

INSERT INTO inscripcion (numero_control, id_grupo_materia, fecha_inscripcion, estatus)
VALUES ('26010001', @id_gm_isc102, CURDATE(), 'ACTIVO')
ON DUPLICATE KEY UPDATE
  fecha_inscripcion = VALUES(fecha_inscripcion),
  estatus = VALUES(estatus);

COMMIT;
