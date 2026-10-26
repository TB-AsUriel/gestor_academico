import { HorarioBloque, RespuestaLista } from '../interfaces';

export interface ResumenHorario {
  clases: number;
  materias: number;
  horas: number;
}

export function normalizarHorario(
  res: HorarioBloque[] | RespuestaLista<HorarioBloque> | null | undefined
): HorarioBloque[] {
  const filas: HorarioBloque[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

  return filas.map((fila) => ({
    ...fila,
    dia: fila.dia ?? fila.nombre_dia ?? '',
    materia: fila.materia ?? fila.nombre_materia ?? '',
    grupo: fila.grupo ?? fila.clave_grupo ?? '',
    docente: fila.docente ?? [
      fila.docente_nombre,
      fila.docente_ap_paterno,
      fila.docente_ap_materno
    ].filter(Boolean).join(' '),
    salon: fila.salon ?? fila.aula ?? [
      fila.edificio,
      fila.numero_aula
    ].filter(Boolean).join('-'),
    hora_inicio: fila.hora_inicio ?? '',
    hora_fin: fila.hora_fin ?? ''
  }));
}

export function formatearHora(hora: string): string {
  return hora ? hora.slice(0, 5) : '—';
}

export function resumenHorario(bloques: HorarioBloque[]): ResumenHorario {
  const materias = new Set(
    bloques.map((bloque) => bloque.clave_materia || bloque.materia || `${bloque.dia}-${bloque.hora_inicio}`)
  ).size;

  const minutos = bloques.reduce((total, bloque) => {
    return total + Math.max(0, minutosDe(bloque.hora_fin) - minutosDe(bloque.hora_inicio));
  }, 0);

  return {
    clases: bloques.length,
    materias,
    horas: Math.round((minutos / 60) * 10) / 10
  };
}

export function bloquesDelDia(bloques: HorarioBloque[], dia: string): HorarioBloque[] {
  return bloques
    .filter((bloque) => bloque.dia === dia)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
}

function minutosDe(hora: string): number {
  const [horas, minutos] = (hora || '').split(':').map(Number);
  if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return 0;
  return horas * 60 + minutos;
}
