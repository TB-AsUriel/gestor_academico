import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { HorarioGridComponent } from '../../shared/components/horario-grid/horario-grid.component';
import { HorarioBloque } from '../../shared/interfaces';

@Component({
  selector: 'app-alumno-horario',
  templateUrl: './horario.page.html',
  styleUrls: ['./horario.page.scss'],
  standalone: true,
  imports: [CommonModule, HorarioGridComponent]
})
export class HorarioPage implements OnInit {
  bloques: HorarioBloque[] = [];
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.api.getHorarioAlumno().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.bloques = res;
        } else if (res && Array.isArray(res.data)) {
          this.bloques = res.data;
        } else {
          this.bloques = [];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.bloques = [];
      }
    });
  }
}
