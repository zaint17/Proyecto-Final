import { Injectable, signal, inject, NgZone } from '@angular/core';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();
  private nextId = 0;
  
  // Inyectamos NgZone para forzar la sincronización en llamadas asíncronas / sondeo
  private zone = inject(NgZone);

  show(mensaje: string, tipo: Toast['tipo'] = 'success', duracion = 3500) {
    // Forzamos la ejecución dentro de la zona activa de Angular
    this.zone.run(() => {
      const id = this.nextId++;
      this._toasts.update(t => [...t, { id, mensaje, tipo }]);
      
      setTimeout(() => this.remove(id), duracion);
    });
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error', 4500); }
  info(msg: string)    { this.show(msg, 'info'); }

  remove(id: number) {
    this.zone.run(() => {
      this._toasts.update(t => t.filter(x => x.id !== id));
    });
  }
}