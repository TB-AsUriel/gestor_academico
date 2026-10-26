import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { HorarioBloque } from '../../interfaces';
import { bloquesDelDia, formatearHora } from '../../utils/horario';

@Component({
  selector: 'app-horario-grid',
  templateUrl: './horario-grid.component.html',
  styleUrls: ['./horario-grid.component.scss'],
  standalone: true,
  imports: [IonIcon]
})
export class HorarioGridComponent {
  @Input() bloques: HorarioBloque[] = [];
  @Input() modo: 'docente' | 'alumno' = 'alumno';
  @Input() cargando = false;
  @Input() error = '';
  @Output() reintentar = new EventEmitter<void>();

  readonly dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  readonly horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  readonly formatoHora = formatearHora;

  getBloques(dia: string, hora: string): HorarioBloque[] {
    return (this.bloques || []).filter(
      (bloque) => bloque.dia === dia && (bloque.hora_inicio || '').startsWith(hora)
    );
  }

  bloquesDia(dia: string): HorarioBloque[] {
    return bloquesDelDia(this.bloques || [], dia);
  }

  colorMateria(bloque: HorarioBloque): string {
    const clave = bloque.clave_materia || bloque.materia || bloque.grupo || 'materia';
    let hash = 0;
    for (let i = 0; i < clave.length; i += 1) {
      hash = (hash * 31 + clave.charCodeAt(i)) % 997;
    }
    return `materia-${(hash % 6) + 1}`;
  }
}
