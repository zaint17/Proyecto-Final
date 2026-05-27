import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialNotificaciones } from './historial-notificaciones';

describe('HistorialNotificaciones', () => {
  let component: HistorialNotificaciones;
  let fixture: ComponentFixture<HistorialNotificaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialNotificaciones],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialNotificaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
