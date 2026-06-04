import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TicketEventsService {
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  
  private socket!: Socket;
  
  private _ticketCreado = new Subject<void>();
  ticketCreado$ = this._ticketCreado.asObservable();

  // Canal reactivo para que la tabla escuche cuando refrescarse
  private _ticketAsignadoEnCaliente = new Subject<void>();
  ticketAsignadoEnCaliente$ = this._ticketAsignadoEnCaliente.asObservable();

  constructor() {
    this.conectarWebSocket();
  }

  private conectarWebSocket() {
    // Conexión al servidor en tiempo real
    this.socket = io('http://localhost:3000', {
      transports: ['websocket']
    });

    // Escuchamos el evento cuando el backend asigne un técnico
    this.socket.on('nuevoTicketAsignado', (data: { tecnico_id: number, ticket_id: string }) => {
      
      // ✅ CORREGIDO: Leemos el usuario usando el Signal nativo expuesto por tu AuthService
      const usuarioActual = this.auth.usuario(); 
      
      // Si el usuario actual es el técnico asignado, lanzamos la alerta flotante
      if (usuarioActual && usuarioActual.id === data.tecnico_id) {
        
        // 🔔 Mensaje personalizado exacto solicitado
        this.toast.success('Tienes un nuevo ticket asignado');
        
        // Emitimos el evento para que la tabla de tickets se recargue en caliente
        this._ticketAsignadoEnCaliente.next();
      }
    });
  }

  emitirTicketCreado() {
    this._ticketCreado.next();
  }
}