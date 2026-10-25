import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioGridComponent } from './horario-grid.component';

describe('HorarioGridComponent', () => {
  let component: HorarioGridComponent;
  let fixture: ComponentFixture<HorarioGridComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HorarioGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
