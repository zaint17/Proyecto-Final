import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TicketService, Ticket } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Plus, Search, RefreshCw, Ticket as TicketIcon } from 'lucide-angular';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [RouterLink, DatePipe, LucideAngularModule],
  templateUrl: './ticket-list.html',
})
export class TicketList implements OnInit {

  readonly Plus       = Plus;
  readonly Search     = Search;
  readonly RefreshCw  = RefreshCw;
  readonly TicketIcon = TicketIcon;

  tickets      = signal<Ticket[]>([]);
  cargando     = signal(true);
  error        = signal('');
  search       = signal('');
  filtroEstado = signal('todos');

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

  constructor(private ticketService: TicketService, public auth: AuthService) {}

  ngOnInit() { this.cargarTickets(); }

  cargarTickets() {
    this.cargando.set(true);
    this.error.set('');
    this.ticketService.getTickets().subscribe({
      next: res => { this.tickets.set(res.data); this.cargando.set(false); },
      error: ()  => { this.error.set('No se pudieron cargar los tickets.'); this.cargando.set(false); }
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
