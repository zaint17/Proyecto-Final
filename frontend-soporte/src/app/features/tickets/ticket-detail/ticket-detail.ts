import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService, TicketDetalle } from '../../../core/services/ticket.service';
import { RespuestaService, Respuesta } from '../../../core/services/respuesta.service';
import { UserService, Tecnico } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  LucideAngularModule, ArrowLeft, User, Wrench,
  MessageSquare, Send, UserCheck, RefreshCw
} from 'lucide-angular';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, LucideAngularModule],
  templateUrl: './ticket-detail.html',
})
export class TicketDetail implements OnInit {

  readonly ArrowLeft   = ArrowLeft;
  readonly User        = User;
  readonly Wrench      = Wrench;
  readonly MessageSquare = MessageSquare;
  readonly Send        = Send;
  readonly UserCheck   = UserCheck;
  readonly RefreshCw   = RefreshCw;

  ticket     = signal<TicketDetalle | null>(null);
  respuestas = signal<Respuesta[]>([]);
  tecnicos   = signal<Tecnico[]>([]);
  cargando   = signal(true);
  error      = signal('');
  nuevoMsg   = signal('');
  enviando   = signal(false);

  tecnicoSeleccionado = signal<number | null>(null);
  estadoSeleccionado  = signal<number | null>(null);

  estados = [
    { id: 1, nombre: 'Abierto' },
    { id: 2, nombre: 'En progreso' },
    { id: 3, nombre: 'Resuelto' },
    { id: 4, nombre: 'Cerrado' },
  ];

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private respuestaService: RespuestaService,
    private userService: UserService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarTicket(id);
    this.cargarRespuestas(id);
    if (this.auth.esAdmin()) this.cargarTecnicos();
  }

  cargarTicket(id: number) {
    this.ticketService.getDetalle(id).subscribe({
      next: res => {
        this.ticket.set(res.data);
        this.estadoSeleccionado.set(res.data.estado_id);
        this.cargando.set(false);
      },
      error: () => { this.error.set('No se pudo cargar el ticket.'); this.cargando.set(false); }
    });
  }

  cargarRespuestas(id: number) {
    this.respuestaService.getRespuestas(id).subscribe({
      next: res => this.respuestas.set(res.data),
      error: () => {}
    });
  }

  cargarTecnicos() {
    this.userService.getTecnicos().subscribe({
      next: res => this.tecnicos.set(res.data),
      error: () => {}
    });
  }

  enviarMensaje() {
    const msg = this.nuevoMsg().trim();
    if (!msg || !this.ticket()) return;
    this.enviando.set(true);
    this.respuestaService.enviar(this.ticket()!.id, msg).subscribe({
      next: res => {
        this.respuestas.update(r => [...r, res.data]);
        this.nuevoMsg.set('');
        this.enviando.set(false);
      },
      error: () => this.enviando.set(false)
    });
  }

  asignarTecnico() {
    if (!this.tecnicoSeleccionado() || !this.ticket()) return;
    this.ticketService.asignarTecnico(this.ticket()!.id, this.tecnicoSeleccionado()!).subscribe({
      next: res => this.ticket.set({ ...this.ticket()!, ...res.data }),
      error: () => alert('Error al asignar técnico')
    });
  }

  cambiarEstado() {
    if (!this.estadoSeleccionado() || !this.ticket()) return;
    this.ticketService.cambiarEstado(this.ticket()!.id, this.estadoSeleccionado()!).subscribe({
      next: res => this.ticket.set({ ...this.ticket()!, ...res.data }),
      error: () => alert('Error al cambiar estado')
    });
  }

  chipClass(estado: string): string {
    const m: Record<string, string> = {
      'Abierto': 'open', 'En progreso': 'progress',
      'Resuelto': 'resolved', 'Cerrado': 'closed'
    };
    return 'chip ' + (m[estado] ?? 'closed');
  }

  esTecnico(rol_id: number): boolean { return rol_id === 2; }
}
