import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TicketService, Ticket } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Plus, Search, RefreshCw, Ticket as TicketIcon } from 'lucide-angular';
import { interval, Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { TicketEventsService } from '../../../core/services/ticket-events.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [RouterLink, DatePipe, LucideAngularModule],
  templateUrl: './ticket-list.html',
})
export class TicketList implements OnInit, OnDestroy {

  readonly Plus       = Plus;
  readonly Search     = Search;
  readonly RefreshCw  = RefreshCw;
  readonly TicketIcon = TicketIcon;

  tickets      = signal<Ticket[]>([]);
  cargando     = signal(true);
  error        = signal('');
  search       = signal('');
  filtroEstado = signal('todos');
  
  private pollingSubscription!: Subscription;

  filteredTickets = computed(() => {
    let lista = this.tickets();

    if (this.search()) {
      const q = this.search().toLowerCase();
      lista = lista.filter(t =>
        t.titulo.toLowerCase().includes(q) ||
        t.cliente.toLowerCase().includes(q)
      );
    }

    if (this.filtroEstado() && this.filtroEstado() !== 'todos') {
      lista = lista.filter(t => t.estado === this.filtroEstado());
    }

    return lista;
  });

  constructor(
    private ticketService: TicketService, 
    public auth: AuthService,
    private toast: ToastService, // Nombre de variable local: toast
    private ticketEventsService: TicketEventsService
  ) {}

 ngOnInit() { 
    this.cargarTickets();

    // Sondeo normal cada 20 segundos
    this.pollingSubscription = interval(20000).subscribe(() => {
      this.ejecutarSondeoSilencioso();
    });

    // 🚀 TIEMPO REAL ABSOLUTO: Si el WebSocket avisa que nos asignaron algo, recargamos la tabla ya mismo
    this.ticketEventsService.ticketAsignadoEnCaliente$.subscribe(() => {
      this.cargarTickets();
    });
  }

  cargarTickets() {
    this.cargando.set(true);
    this.error.set('');
    this.ticketService.getTickets().subscribe({
      next: res => { 
        if (res && res.data) {
          this.tickets.set(res.data); 
        }
        this.cargando.set(false); 
      },
      error: () => { 
        this.error.set('No se pudieron cargar los tickets.'); 
        this.cargando.set(false); 
      }
    });
  }

  ejecutarSondeoSilencioso() {
    this.ticketService.getTickets().subscribe({
      next: res => {
        if (!res || !res.data) return;

        const nuevosTickets = res.data;
        const idsActuales = this.tickets().map(t => t.id);
        
        // 🔍 COMPROBACIÓN DOBLE Y ROBUSTA:
        // Caso A: Hay algún ID que llegó del servidor que el técnico no tenía pintado.
        const tieneTicketNuevo = nuevosTickets.some(t => !idsActuales.includes(t.id));
        // Caso B: Cambió la longitud general de los tickets asignados (ej. subió de 2 a 3)
        const cambioCantidad = nuevosTickets.length > idsActuales.length;

        if (tieneTicketNuevo || cambioCantidad) {
          // 1. Inyectamos la data forzando una nueva referencia para que Angular refresque la UI
          this.tickets.set([...nuevosTickets]);
          
          // 2. CORREGIDO: Se llama usando 'this.toast' que coincide con el constructor
          this.toast.success('🔔 ¡Bandeja Actualizada! Se te ha asignado un nuevo ticket de soporte.');
        } else {
          // Si no hay variación en la cantidad de registros, actualizamos silenciosamente por si cambió el texto
          this.tickets.set([...nuevosTickets]);
        }
      },
      error: () => console.warn('Sondeo silencioso temporalmente pausado por red.')
    });
  }

  chipClass(estado: string): string {
    if (!estado) return 'chip closed';
    
    const key = estado.trim().toLowerCase();

    const m: Record<string, string> = {
      'abierto': 'open',
      'en progreso': 'progress',
      'resuelto': 'closed', 
      'cerrado': 'closed'
    };

    return 'chip ' + (m[key] ?? 'closed');
  }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}