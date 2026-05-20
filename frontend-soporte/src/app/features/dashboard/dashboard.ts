import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TicketService, Ticket } from '../../core/services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import {
  LucideAngularModule,
  Ticket as TicketIcon, AlertCircle, Clock, CheckCircle2,
  ArrowRight, TrendingUp
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {

  readonly Math = Math;
  readonly TicketIcon    = TicketIcon;
  readonly AlertCircle   = AlertCircle;
  readonly Clock         = Clock;
  readonly CheckCircle2  = CheckCircle2;
  readonly ArrowRight    = ArrowRight;
  readonly TrendingUp    = TrendingUp;

  tickets   = signal<Ticket[]>([]);
  cargando  = signal(true);

  total      = computed(() => this.tickets().length);
  abiertos   = computed(() => this.tickets().filter(t => t.estado === 'Abierto').length);
  enProgreso = computed(() => this.tickets().filter(t => t.estado === 'En progreso').length);
  resueltos  = computed(() => this.tickets().filter(t => t.estado === 'Resuelto' || t.estado === 'Cerrado').length);

  alta  = computed(() => this.tickets().filter(t => t.prioridad === 'Alta').length);
  media = computed(() => this.tickets().filter(t => t.prioridad === 'Media').length);
  baja  = computed(() => this.tickets().filter(t => t.prioridad === 'Baja').length);

  recientes = computed(() => this.tickets().slice(0, 5));

  pctAlta  = computed(() => this.total() ? Math.round(this.alta()  / this.total() * 100) : 0);
  pctMedia = computed(() => this.total() ? Math.round(this.media() / this.total() * 100) : 0);
  pctBaja  = computed(() => this.total() ? Math.round(this.baja()  / this.total() * 100) : 0);

  constructor(private ticketService: TicketService, public auth: AuthService) {}

  ngOnInit() {
    this.ticketService.getTickets().subscribe({
      next: res => { this.tickets.set(res.data); this.cargando.set(false); },
      error: ()  => this.cargando.set(false)
    });
  }

  chipClass(estado: string): string {
    const m: Record<string, string> = {
      'Abierto': 'open', 'En progreso': 'progress',
      'Resuelto': 'resolved', 'Cerrado': 'closed'
    };
    return 'chip ' + (m[estado] ?? 'closed');
  }
}
