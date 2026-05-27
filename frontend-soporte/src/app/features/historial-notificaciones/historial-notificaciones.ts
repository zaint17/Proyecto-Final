import { Component, OnInit, signal } from '@angular/core';
import { TicketService } from '../../core/services/ticket.service';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Bell, Eye } from 'lucide-angular';

@Component({
  selector: 'app-historial-notificaciones',
  standalone: true,
  imports: [DatePipe, RouterLink, LucideAngularModule],
  templateUrl: './historial-notificaciones.html'
})
export class HistorialNotificaciones implements OnInit {
  readonly Bell = Bell;
  readonly Eye = Eye;

  historial = signal<any[]>([]);
  cargando = signal(true);

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.cargarHistorialGlobal();
  }

  cargarHistorialGlobal() {
    this.ticketService.getHistorialGlobal().subscribe({
      next: res => {
        this.historial.set(res.data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}