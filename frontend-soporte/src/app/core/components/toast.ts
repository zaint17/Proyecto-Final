import { Component } from '@angular/core';
import { ToastService, Toast } from '../services/toast.service';
import { LucideAngularModule, CheckCircle2, XCircle, Info, X } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div style="position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;max-width:360px">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [attr.data-tipo]="toast.tipo"
             style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.4);animation:slideIn .2s ease;font-size:14px"
             [style.background]="bg(toast.tipo)"
             [style.border]="border(toast.tipo)"
             [style.color]="color(toast.tipo)">

          @if (toast.tipo === 'success') {
            <lucide-icon [img]="CheckCircle2" size="18" aria-hidden="true" style="flex-shrink:0;margin-top:1px"></lucide-icon>
          } @else if (toast.tipo === 'error') {
            <lucide-icon [img]="XCircle" size="18" aria-hidden="true" style="flex-shrink:0;margin-top:1px"></lucide-icon>
          } @else {
            <lucide-icon [img]="Info" size="18" aria-hidden="true" style="flex-shrink:0;margin-top:1px"></lucide-icon>
          }

          <span style="flex:1;line-height:1.5">{{ toast.mensaje }}</span>

          <button (click)="toastService.remove(toast.id)"
            style="background:none;border:none;cursor:pointer;opacity:.6;display:flex;padding:0"
            [style.color]="color(toast.tipo)">
            <lucide-icon [img]="X" size="15" aria-hidden="true"></lucide-icon>
          </button>
        </div>
      }
    </div>

    <style>
      @keyframes slideIn {
        from { opacity:0; transform:translateX(20px); }
        to   { opacity:1; transform:translateX(0); }
      }
    </style>
  `,
})
export class ToastComponent {
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle      = XCircle;
  readonly Info         = Info;
  readonly X            = X;

  constructor(public toastService: ToastService) {}

  bg(tipo: Toast['tipo']): string { 
    return tipo === 'success' ? '#062312' : tipo === 'error' ? '#2a0f0f' : '#0f1a2a'; 
  }
  
  border(tipo: Toast['tipo']): string { 
    return tipo === 'success' ? '1px solid #14532d' : tipo === 'error' ? '1px solid #EF444440' : '1px solid #4F7EFF40'; 
  }
  
  color(tipo: Toast['tipo']): string { 
    return tipo === 'success' ? '#4ade80' : tipo === 'error' ? '#FCA5A5' : '#93BBFD'; 
  }
}