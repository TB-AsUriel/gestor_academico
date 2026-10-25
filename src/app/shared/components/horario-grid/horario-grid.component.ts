import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorarioBloque } from '../../interfaces';

@Component({
  selector: 'app-horario-grid',
  templateUrl: './horario-grid.component.html',
  styleUrls: ['./horario-grid.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HorarioGridComponent {
  @Input() bloques: HorarioBloque[] = [];
  @Input() modo: 'docente' | 'alumno' = 'alumno';

  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  getBloques(dia: string, hora: string): HorarioBloque[] {
    return (this.bloques || []).filter(b => b.dia === dia && (b.hora_inicio || '').startsWith(hora));
  }
}
