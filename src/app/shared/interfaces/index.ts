export interface Usuario {
  id_usuario?: number;
  correo?: string;
  rol?: 'ADMIN' | 'DOCENTE' | 'ALUMNO';
  id_docente?: number;
  numero_control?: string;
}

export interface Carrera {
  id_carrera?: number;
  clave?: string;
  nombre?: string;
  activo?: boolean;
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
  [key: string]: any;
}
