import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TicketService, Ticket } from '../../core/services/ticket.service';
import { TicketEventsService } from '../../core/services/ticket-events.service';
import { AuthService } from '../../core/services/auth.service';
import {
  LucideAngularModule,
  Ticket as TicketIcon, AlertCircle, Clock, CheckCircle2, ArrowRight
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink,LucideAngularModule],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit, OnDestroy {

  readonly TicketIcon   = TicketIcon;
  readonly AlertCircle  = AlertCircle;
  readonly Clock        = Clock;
  readonly CheckCircle2 = CheckCircle2;
  readonly ArrowRight   = ArrowRight;
  readonly Math         = Math;

  tickets  = signal<Ticket[]>([]);
  cargando = signal(true);

  total      = computed(() => this.tickets().length);
  abiertos   = computed(() => this.tickets().filter(t => t.estado === 'Abierto').length);
  enProgreso = computed(() => this.tickets().filter(t => t.estado.trim().toLowerCase() === 'en progreso').length);
  resueltos  = computed(() => this.tickets().filter(t => t.estado === 'Resuelto' || t.estado === 'Cerrado').length);

  alta  = computed(() => this.tickets().filter(t => t.prioridad === 'Alta').length);
  media = computed(() => this.tickets().filter(t => t.prioridad === 'Media').length);
  baja  = computed(() => this.tickets().filter(t => t.prioridad === 'Baja').length);

  recientes = computed(() => this.tickets().slice(0, 5));

  pctAlta  = computed(() => this.total() ? Math.round(this.alta()  / this.total() * 100) : 0);
  pctMedia = computed(() => this.total() ? Math.round(this.media() / this.total() * 100) : 0);
  pctBaja  = computed(() => this.total() ? Math.round(this.baja()  / this.total() * 100) : 0);

  private sub!: Subscription;

  constructor(
    private ticketService: TicketService,
    private ticketEvents: TicketEventsService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.cargar();
    // Se recarga automáticamente cada vez que se crea un ticket
    this.sub = this.ticketEvents.ticketCreado$.subscribe(() => this.cargar());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  cargar() {
    this.cargando.set(true);
    this.ticketService.getTickets().subscribe({
      next: res => { this.tickets.set(res.data); this.cargando.set(false); },
      error: ()  => this.cargando.set(false)
    });
  }

  chipClass(estado: string): string {

  const key = estado.trim().toLowerCase();

  const m: Record<string, string> = {
    'abierto': 'open',
    'en progreso': 'progress',
    'resuelto': 'resolved',
    'cerrado': 'closed'
  };

  return 'chip ' + (m[key] ?? 'closed');
}
}