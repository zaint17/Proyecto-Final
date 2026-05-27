import { Injectable, signal } from '@angular/core';

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

  show(mensaje: string, tipo: Toast['tipo'] = 'success', duracion = 3500) {
    const id = this.nextId++;
    this._toasts.update(t => [...t, { id, mensaje, tipo }]);
    setTimeout(() => this.remove(id), duracion);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error', 4500); }
  info(msg: string)    { this.show(msg, 'info'); }

  remove(id: number) {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }
}