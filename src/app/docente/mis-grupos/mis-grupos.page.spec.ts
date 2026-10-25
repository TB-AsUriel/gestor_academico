import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisGruposPage } from './mis-grupos.page';

describe('MisGruposPage', () => {
  let component: MisGruposPage;
  let fixture: ComponentFixture<MisGruposPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisGruposPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
