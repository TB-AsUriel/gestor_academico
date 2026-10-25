import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiHorarioPage } from './mi-horario.page';

describe('MiHorarioPage', () => {
  let component: MiHorarioPage;
  let fixture: ComponentFixture<MiHorarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MiHorarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
