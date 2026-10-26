import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AsignacionDocente,
  Carrera,
  HorarioBloque,
  RespuestaApi,
  RespuestaLista
} from '../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getCarreras(): Observable<Carrera[] | RespuestaLista<Carrera>> {
    return this.http.get<Carrera[] | RespuestaLista<Carrera>>(this.base + '/admin/carreras.php');
  }

  crearCarrera(data: Carrera): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(this.base + '/admin/carreras.php', data);
  }

  actualizarCarrera(data: Carrera): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(this.base + '/admin/carreras.php', data);
  }

  eliminarCarrera(claveCarrera: string): Observable<RespuestaApi> {
    return this.http.request<RespuestaApi>('delete', this.base + '/admin/carreras.php', {
      body: { clave_carrera: claveCarrera }
    });
  }

  getHorarioDocente(): Observable<HorarioBloque[] | RespuestaLista<HorarioBloque>> {
    return this.http.get<HorarioBloque[] | RespuestaLista<HorarioBloque>>(this.base + '/docente/horario.php');
  }

  getHorarioAlumno(): Observable<HorarioBloque[] | RespuestaLista<HorarioBloque>> {
    return this.http.get<HorarioBloque[] | RespuestaLista<HorarioBloque>>(this.base + '/alumno/horario.php');
  }

  getMisAsignaciones(): Observable<AsignacionDocente[] | RespuestaLista<AsignacionDocente>> {
    return this.http.get<AsignacionDocente[] | RespuestaLista<AsignacionDocente>>(
      this.base + '/docente/mis-asignaciones.php'
    );
  }
}
