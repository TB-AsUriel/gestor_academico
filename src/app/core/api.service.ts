import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Carrera } from '../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCarreras(): Observable<Carrera[] | { data: Carrera[] }> {
    return this.http.get<Carrera[] | { data: Carrera[] }>(this.base + '/admin/carreras.php');
  }

  crearCarrera(data: Partial<Carrera>): Observable<any> {
    return this.http.post(this.base + '/admin/carreras.php', data);
  }

  actualizarCarrera(data: Partial<Carrera>): Observable<any> {
    return this.http.put(this.base + '/admin/carreras.php', data);
  }

  eliminarCarrera(id_carrera: number): Observable<any> {
    return this.http.request('delete', this.base + '/admin/carreras.php', { body: { id_carrera } });
  }

  getHorarioDocente(): Observable<any> {
    return this.http.get(this.base + '/docente/horario.php');
  }

  getHorarioAlumno(): Observable<any> {
    return this.http.get(this.base + '/alumno/horario.php');
  }
}
