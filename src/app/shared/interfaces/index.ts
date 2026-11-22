export type RolUsuario = 'ADMIN' | 'DOCENTE' | 'ALUMNO';
export type NumeroLike = number | string | null;

export interface Usuario {
  id_usuario?: number;
  usuario?: string;
  rol?: RolUsuario;
  numero_control?: NumeroLike;
  matricula_trabajador?: NumeroLike;
  activo?: number;
  fecha_creacion?: string;
  correo?: string; // compat
  nombre?: string;
}

export interface Area {
  id_area_rol: number;
  nombre_area: string;
}

export interface Carrera {
  clave_carrera: NumeroLike;
  nombre_carrera: string;
  plan_estudios?: string;
  total_creditos: NumeroLike;
  duracion_semestres?: NumeroLike;
}

export interface Materia {
  clave_materia: NumeroLike;
  nombre_materia: string;
  creditos: NumeroLike;
  tipo_materia: string;
  clave_materia_recur?: NumeroLike;
}

export interface Reticula {
  clave_reticula: NumeroLike;
  plan_estudios: string;
  semestre: NumeroLike;
  clave_materia: NumeroLike;
  nombre_materia?: string;
  nombre_carrera?: string;
  creditos?: NumeroLike;
  cadena_materia?: string | null;
}

export interface ReticulaAlumno {
  clave_reticula?: NumeroLike;
  plan_estudios?: string;
  semestre: NumeroLike;
  clave_materia: NumeroLike;
  nombre_materia: string;
  tipo_materia?: string;
  creditos: NumeroLike;
  cadena_materia?: string | null;
  nombre_carrera?: string;
  situacion?: 'CURSADA' | 'CURSANDO' | 'POR_CURSAR' | string;
}

export interface KardexMateria {
  clave_reticula?: NumeroLike;
  plan_estudios?: string;
  semestre: NumeroLike;
  clave_materia: NumeroLike;
  nombre_materia: string;
  tipo_materia?: string;
  creditos: NumeroLike;
  cadena_materia?: string | null;
  clave_materia_recur?: NumeroLike;
  calificacion_final?: NumeroLike;
  situacion: 'APROBADA' | 'CURSANDO' | 'REPROBADA' | 'PENDIENTE' | string;
  requisito?: { clave_materia: NumeroLike; nombre_materia?: string } | null;
  habilita?: Array<{ clave_materia: NumeroLike; nombre_materia?: string; semestre?: NumeroLike }>;
}

export interface DatosPersonales {
  correo_institucional?: string | null;
  telefono?: string | null;
  calle?: string | null;
  colonia?: string | null;
  no_exterior?: string | null;
  no_interior?: string | null;
  codigo_postal?: string | null;
  municipio?: string | null;
  estado?: string | null;
}

export interface Docente extends DatosPersonales {
  matricula_trabajador: NumeroLike;
  nombre: string;
  snombre?: string | null;
  apellido_paterno: string;
  apellido_materno?: string | null;
  genero?: string | null;
  fecha_nacimiento?: string | null;
  nombre_completo?: string;
}

export interface HistorialDocente {
  id_historial?: number;
  matricula_trabajador: NumeroLike;
  id_rol: number;
  fecha_inicio: string;
  fecha_fin?: string | null;
  administrativo: string;
  docente: string;
  estatus: string;
  nombre_area?: string;
  nombre_docente?: string;
}

export interface Alumno extends DatosPersonales {
  numero_control: NumeroLike;
  nombre: string;
  snombre?: string | null;
  apellido_paterno: string;
  apellido_materno?: string | null;
  fecha_nacimiento?: string | null;
  genero?: string | null;
  semestre_actual: NumeroLike;
  anio_ingreso: NumeroLike;
  estatus: string;
  fk_clave_carrera: NumeroLike;
  nombre_carrera?: string;
  creditos_acumulados?: NumeroLike;
  avance?: NumeroLike;
  nombre_completo?: string;
}

export interface Edificio {
  no_edificio: number;
  nombre_edificio: string;
  laboratorio: string;
  salon: string;
  auditorio: string;
  capacidad: NumeroLike;
}

export interface Grupo {
  clave_grupo: NumeroLike;
  clave_materia: NumeroLike;
  nombre_materia?: string;
  creditos?: NumeroLike;
  cupo: NumeroLike;
  inscritos?: NumeroLike;
  capturadas?: NumeroLike;
  clave_periodo?: NumeroLike;
  nombre_periodo?: string;
  periodo_activo?: NumeroLike;
  matricula_trabajador?: NumeroLike;
  nombre_docente?: string | null;
  no_edificio?: NumeroLike;
  nombre_edificio?: string | null;
  semestre?: NumeroLike;
  turno?: string | null;
}

export interface HorarioAdmin {
  id_horario: number;
  clave_grupo?: NumeroLike;
  numero_control?: NumeroLike;
  matricula_trabajador?: NumeroLike;
  nombre_docente?: string;
  clave_materia?: NumeroLike;
  nombre_materia?: string;
  dia_semana: string;
  nombre_dia?: string;
  id_dia?: string | number;
  hora_inicio: string;
  hora_fin: string;
  salon: string;
  no_edificio: number;
  nombre_edificio?: string;
}

export interface CargaAdmin {
  id_carga: number;
  numero_control: NumeroLike;
  nombre_alumno?: string;
  clave_grupo: NumeroLike;
  clave_materia?: NumeroLike;
  nombre_materia?: string;
  fecha_inscripcion?: string | null;
  estatus?: string;
  nombre_edificio?: string | null;
  clave_periodo?: NumeroLike;
  nombre_periodo?: string | null;
  periodo_activo?: NumeroLike;
  creditos?: NumeroLike;
  semestre?: NumeroLike;
  turno?: string | null;
  nombre_docente?: string | null;
  nombre_dia?: string | null;
  dia_semana?: string | null;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  salon?: string | null;
  id_dia?: NumeroLike;
}

export interface Calificacion {
  id_historial?: number | null;
  numero_control: NumeroLike;
  nombre_alumno?: string;
  correo_institucional?: string | null;
  clave_grupo: NumeroLike;
  clave_materia?: NumeroLike;
  nombre_materia?: string;
  calificacion_final?: NumeroLike;
  calificacion_ordinaria?: NumeroLike;
  calificacion_segunda_oportunidad?: NumeroLike;
  capturada: NumeroLike;
  fecha_captura?: string | null;
  resultado?: string;
}

export interface GrupoCalificaciones {
  clave_grupo: NumeroLike;
  cupo?: NumeroLike;
  clave_materia?: NumeroLike;
  nombre_materia?: string;
  creditos?: NumeroLike;
  inscritos?: NumeroLike;
  clave_periodo?: NumeroLike;
  nombre_periodo?: string | null;
  periodo_activo?: NumeroLike;
  nombre_docente?: string | null;
}

export interface Kardex {
  ingreso?: NumeroLike;
  numero_control: NumeroLike;
  nombre_alumno?: string;
  clave_materia: NumeroLike;
  nombre_materia?: string;
  creditos?: NumeroLike;
  periodo: string;
  calificacion_final?: NumeroLike;
  calificacion_ordinaria?: NumeroLike;
  calificacion_segunda_oportunidad?: NumeroLike;
  resultado?: string;
  avance?: NumeroLike;
  capturada?: NumeroLike;
}

export interface AlumnoInfo extends DatosPersonales {
  numero_control: NumeroLike;
  nombre_completo?: string;
  nombre: string;
  snombre?: string | null;
  apellido_paterno: string;
  apellido_materno?: string | null;
  fecha_nacimiento?: string | null;
  genero?: string | null;
  semestre_actual: NumeroLike;
  anio_ingreso: NumeroLike;
  estatus: string;
  clave_carrera?: NumeroLike;
  nombre_carrera?: string;
  plan_estudios?: string;
  total_creditos?: NumeroLike;
  creditos_acumulados?: NumeroLike;
  avance?: NumeroLike;
}

export interface DocentePerfil extends DatosPersonales {
  matricula_trabajador: NumeroLike;
  nombre_completo?: string;
  nombre: string;
  snombre?: string | null;
  apellido_paterno: string;
  apellido_materno?: string | null;
  nombre_area?: string;
  administrativo?: string;
  docente?: string;
  estatus?: string;
  fecha_inicio?: string;
}

export interface UsuarioAdmin extends Usuario {
  id_usuario: number;
  usuario: string;
  rol: RolUsuario;
  activo: number;
  contrasena?: string | null;
}

export interface PeriodoResumen {
  clave_periodo?: NumeroLike;
  nombre_periodo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_periodo?: string;
}

export interface GrupoResumenAdmin {
  clave_grupo: NumeroLike;
  cupo: NumeroLike;
  nombre_materia: string;
  nombre_edificio: string;
  nombre_docente: string;
  inscritos: NumeroLike;
}

export interface ResumenAdmin {
  conteos: Record<string, number>;
  periodo: PeriodoResumen | null;
  grupos_activos: number;
  inscritos_activos: number;
  estadistica: {
    aprobados: NumeroLike;
    reprobados: NumeroLike;
    pendientes: NumeroLike;
    promedio: NumeroLike;
  };
  grupos: GrupoResumenAdmin[];
}

export interface KardexResumen {
  materias?: NumeroLike;
  aprobadas?: NumeroLike;
  reprobadas?: NumeroLike;
  cursando?: NumeroLike;
  pendientes?: NumeroLike;
  creditos?: NumeroLike;
  en_curso?: NumeroLike;
  promedio?: NumeroLike;
}

export interface ResumenAlumno {
  alumno: AlumnoInfo | null;
  periodo: PeriodoResumen | null;
  materias_inscritas: number;
  kardex?: KardexResumen | null;
}

export interface ResumenDocente {
  perfil: DocentePerfil | null;
  resumen: { grupos: NumeroLike; materias: NumeroLike; alumnos: NumeroLike };
  periodo: PeriodoResumen | null;
  grupos: Array<any>;
}

export interface DocenteCarga {
  clave_grupo?: NumeroLike;
  clave_materia?: NumeroLike;
  nombre_materia?: string;
  creditos?: NumeroLike;
  inscritos?: NumeroLike;
  capturadas?: NumeroLike;
  dia_semana?: string;
  nombre_dia?: string;
  hora_inicio?: string;
  hora_fin?: string;
  salon?: string;
  nombre_edificio?: string;
  clave_periodo?: NumeroLike;
  nombre_periodo?: string;
  periodo_activo?: NumeroLike;
}

export interface HorarioBloque {
  id_horario?: number;
  dia?: string;
  nombre_dia?: string;
  dia_semana?: string;
  hora_inicio: string;
  hora_fin: string;
  materia?: string;
  nombre_materia?: string;
  grupo?: NumeroLike;
  clave_grupo?: NumeroLike;
  docente?: string;
  nombre_docente?: string;
  salon?: string;
  nombre_edificio?: string;
  clave_materia?: NumeroLike;
  clave_periodo?: NumeroLike;
  docente_nombre?: string;
  docente_ap_paterno?: string;
  docente_ap_materno?: string;
  edificio?: string;
  numero_aula?: string;
  aula?: string;
  [key: string]: unknown;
}

export interface RespuestaLista<T> {
  status?: string;
  message?: string;
  data?: T[];
}

export interface RespuestaDetalle<T> {
  status?: string;
  message?: string;
  data?: T;
}

export interface RespuestaApi {
  status?: string;
  message?: string;
  id?: number;
}
