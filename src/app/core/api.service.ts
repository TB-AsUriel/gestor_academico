import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import {
  AlumnoInfo,
  Calificacion,
  CargaAdmin,
  DocenteCarga,
  DocentePerfil,
  GrupoCalificaciones,
  HorarioBloque,
  Kardex,
  KardexMateria,
  KardexResumen,
  RespuestaApi,
  ReticulaAlumno,
  RespuestaLista,
  ResumenAdmin,
  ResumenAlumno,
  ResumenDocente
} from '../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private get base(): string {
    return this.resolverBase(this.auth.getIp());
  }

  resolverBase(ip?: string): string {
    const raw = (ip ?? this.auth.getIp() ?? '').trim();
    if (!raw) return environment.apiUrl;
    let val = raw.replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(val)) {
      val = `http://${val}`;
    }
    if (!/\/api_gestor$/i.test(val)) {
      val = `${val}/api_gestor`;
    }
    return val;
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.base + path);
  }

  post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.post<T>(this.base + path, body);
  }

  put<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.put<T>(this.base + path, body);
  }

  delete<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.request<T>('delete', this.base + path, { body });
  }

  listarCatalogo<T>(endpoint: string): Observable<RespuestaLista<T>> {
    return this.get<RespuestaLista<T>>(`/admin/${endpoint}.php`);
  }

  getResumenAdmin(): Observable<ResumenAdmin> {
    return this.get<ResumenAdmin>('/admin/resumen.php');
  }

  getResumenAlumno(): Observable<ResumenAlumno> {
    return this.get<ResumenAlumno>('/alumno/resumen.php');
  }

  getResumenDocente(): Observable<ResumenDocente> {
    return this.get<ResumenDocente>('/docente/resumen.php');
  }

  getAlumnoInfo(): Observable<{ status: string; data: AlumnoInfo }> {
    return this.get<{ status: string; data: AlumnoInfo }>('/alumno/mi-datos.php');
  }

  actualizarAlumnoInfo(data: {
    telefono?: string;
    calle?: string;
    colonia?: string;
    no_exterior?: string | null;
    no_interior?: string | null;
    codigo_postal?: string;
    municipio?: string;
    estado?: string;
  }): Observable<{ status: string; message: string; data: AlumnoInfo }> {
    return this.put<{ status: string; message: string; data: AlumnoInfo }>('/alumno/mi-datos.php', data);
  }

  getAlumnoKardex(): Observable<{
    status: string;
    data: Kardex[];
    reticula: KardexMateria[];
    resumen: KardexResumen;
    alumno: AlumnoInfo;
  }> {
    return this.get('/alumno/kardex.php');
  }

  getAlumnoCarga(): Observable<RespuestaLista<CargaAdmin>> {
    return this.get<RespuestaLista<CargaAdmin>>('/alumno/carga.php');
  }

  getAlumnoReticula(): Observable<RespuestaLista<ReticulaAlumno>> {
    return this.get<RespuestaLista<ReticulaAlumno>>('/alumno/reticula.php');
  }

  getHorarioDocente(): Observable<HorarioBloque[] | RespuestaLista<HorarioBloque>> {
    return this.http.get<HorarioBloque[] | RespuestaLista<HorarioBloque>>(this.base + '/docente/horario.php');
  }

  getHorarioAlumno(): Observable<HorarioBloque[] | RespuestaLista<HorarioBloque>> {
    return this.http.get<HorarioBloque[] | RespuestaLista<HorarioBloque>>(this.base + '/alumno/horario.php');
  }

  getDocentePerfil(): Observable<{
    status: string;
    data: DocentePerfil;
    resumen: { grupos: number | string | null; alumnos: number | string | null; materias?: number | string | null };
    periodo: Record<string, unknown> | null;
  }> {
    return this.get('/docente/mi-perfil.php');
  }

  getDocenteResumen(): Observable<ResumenDocente> {
    return this.get<ResumenDocente>('/docente/resumen.php');
  }

  actualizarDocenteInfo(data: {
    telefono?: string;
    calle?: string;
    colonia?: string;
    no_exterior?: string | null;
    no_interior?: string | null;
    codigo_postal?: string;
    municipio?: string;
    estado?: string;
  }): Observable<{ status: string; message: string; data: DocentePerfil }> {
    return this.put<{ status: string; message: string; data: DocentePerfil }>('/docente/mi-datos.php', data);
  }

  getDocenteGrupos(): Observable<RespuestaLista<DocenteCarga>> {
    return this.get<RespuestaLista<DocenteCarga>>('/docente/mis-grupos.php');
  }

  getDocenteGrupo(claveGrupo: string): Observable<{
    status: string;
    grupo: DocenteCarga | null;
    horario: DocenteCarga[];
    alumnos: Array<{
      numero_control: string;
      nombre_alumno: string;
      correo_institucional?: string | null;
      telefono?: string | null;
      fecha_inscripcion: string;
      estatus: string;
    }>;
  }> {
    return this.get(`/docente/grupo.php?clave_grupo=${encodeURIComponent(claveGrupo)}`);
  }

  getCalificaciones(claveGrupo: string): Observable<{
    status: string;
    grupo: GrupoCalificaciones | null;
    data: Calificacion[];
  }> {
    return this.get(`/docente/calificaciones.php?clave_grupo=${encodeURIComponent(claveGrupo)}`);
  }

  getCalificacionesDocente(claveGrupo: string): Observable<{
    status: string;
    grupo: GrupoCalificaciones | null;
    data: Calificacion[];
  }> {
    return this.get(`/docente/calificaciones.php?clave_grupo=${encodeURIComponent(claveGrupo)}`);
  }

  getCalificacionesAdmin(claveGrupo: string): Observable<{
    status: string;
    grupo: GrupoCalificaciones | null;
    data: Calificacion[];
  }> {
    return this.get(`/admin/calificaciones.php?clave_grupo=${encodeURIComponent(claveGrupo)}`);
  }

  guardarCalificacionAdmin(data: {
    numero_control: string | number;
    clave_grupo: string | number;
    calificacion_ordinaria?: number | null;
    calificacion_segunda_oportunidad?: number | null;
    calificacion_final?: number | null;
    capturada?: number;
  }): Observable<RespuestaApi> {
    return this.post<RespuestaApi>('/admin/calificaciones.php', data);
  }

  eliminarCalificacionAdmin(data: {
    id_historial?: number;
    numero_control?: string | number;
    clave_grupo?: string | number;
  }): Observable<RespuestaApi> {
    return this.delete<RespuestaApi>('/admin/calificaciones.php', data);
  }

  guardarCalificacion(data: {
    numero_control: string | number;
    clave_grupo: string | number;
    calificacion_final?: number | null;
    calificacion_ordinaria?: number | null;
    calificacion_segunda_oportunidad?: number | null;
    capturada?: number;
  }, docente = true): Observable<RespuestaApi> {
    return this.post<RespuestaApi>(
      docente ? '/docente/calificaciones.php' : '/docente/calificaciones.php',
      data
    );
  }

  eliminarCalificacion(
    data: { id_historial?: number; numero_control?: string | number; clave_grupo?: string | number },
    docente = true
  ): Observable<RespuestaApi> {
    return this.delete<RespuestaApi>(
      docente ? '/docente/calificaciones.php' : '/docente/calificaciones.php',
      data
    );
  }
}
