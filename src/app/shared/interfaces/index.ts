export interface Usuario {
  id_usuario?: number;
  correo?: string;
  rol?: 'ADMIN' | 'DOCENTE' | 'ALUMNO';
  id_docente?: number;
  numero_control?: string;
}

export interface Carrera {
  clave_carrera: string;
  nombre_carrera: string;
  total_creditos: number;
  duracion_semestres: number;
}

export interface AsignacionDocente {
  id_asignacion: number;
  id_grupo_materia: number;
  clave_materia: string;
  nombre_materia: string;
  creditos: number | string;
  clave_grupo: string;
  semestre: number | string;
  turno: string;
  clave_periodo: string;
}

export interface HorarioBloque {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  materia?: string;
  grupo?: string;
  docente?: string;
  salon?: string;
  aula?: string;
  id_horario?: number;
  clave_materia?: string;
  clave_periodo?: string;
  creditos?: number | string;
  semestre?: number | string;
  turno?: string;
  docente_nombre?: string;
  docente_ap_paterno?: string;
  docente_ap_materno?: string;
  nombre_dia?: string;
  nombre_materia?: string;
  clave_grupo?: string;
  edificio?: string;
  numero_aula?: string;
  id_dia?: number;
  [key: string]: any;
}

export interface RespuestaLista<T> {
  status?: string;
  message?: string;
  data?: T[];
}

export interface RespuestaApi {
  status?: string;
  message?: string;
}
