import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService, TicketDetalle } from '../../../core/services/ticket.service';
import { RespuestaService, Respuesta } from '../../../core/services/respuesta.service';
import { UserService, Tecnico } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  LucideAngularModule, ArrowLeft, User, Wrench,
  MessageSquare, Send, UserCheck, RefreshCw, Bell
} from 'lucide-angular';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, LucideAngularModule],
  templateUrl: './ticket-detail.html',
})
export class TicketDetail implements OnInit {

  readonly ArrowLeft    = ArrowLeft;
  readonly User         = User;
  readonly Wrench       = Wrench;
  readonly MessageSquare = MessageSquare;
  readonly Send         = Send;
  readonly UserCheck    = UserCheck;
  readonly RefreshCw    = RefreshCw;
  readonly Bell         = Bell; // Icono para la sección de notificaciones

  ticket     = signal<TicketDetalle | null>(null);
  respuestas = signal<Respuesta[]>([]);
  tecnicos   = signal<Tecnico[]>([]);
  historialNotificaciones = signal<any[]>([]); // Signal agregado para guardar la bitácora
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
    private toast: ToastService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarTicket(id);
    this.cargarRespuestas(id);
    this.cargarHistorial(id); // Carga inicial del historial de notificaciones
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

  cargarHistorial(ticketId: number) {
    this.ticketService.getHistorialNotificaciones(ticketId).subscribe({
      next: res => this.historialNotificaciones.set(res.data),
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
      next: res => {
        this.ticket.set({ ...this.ticket()!, ...res.data });
        this.toast.success('Técnico asignado correctamente');
      },
      error: () => this.toast.error('Error al asignar técnico')
    });
  }

  cambiarEstado() {
    if (!this.estadoSeleccionado() || !this.ticket()) return;
    this.ticketService.cambiarEstado(this.ticket()!.id, this.estadoSeleccionado()!).subscribe({
      next: res => {
        this.ticket.set({ ...this.ticket()!, ...res.data });
        this.toast.success('Estado actualizado correctamente');
      },
      error: () => this.toast.error('Error al cambiar estado')
    });
  }

  notificarPorWhatsApp(ticket: any) {
    if (!ticket.cliente_telefono) {
      this.toast.error('El cliente no tiene un teléfono registrado.');
      return;
    }
    const telefonoFormateado = ticket.cliente_telefono.replace(/\s+/g, ''); 
    const mensaje = `Hola ${ticket.cliente_nombre}, te saludamos de Distribuidora LURESA. Te informamos que tu requerimiento de soporte técnico con código #${ticket.id} (${ticket.titulo}) ya se encuentra SOLUCIONADO y listo para recoger. ¡Gracias por tu confianza!`;
    
    const urlWhatsapp = `https://wa.me/51${telefonoFormateado}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsapp, '_blank');

    this.ticketService.registrarNotificacion(ticket.id, mensaje).subscribe({
      next: () => {
        this.toast.success('Notificación registrada en el historial.');
        this.cargarHistorial(ticket.id); 
      },
      error: () => this.toast.error('No se pudo guardar el registro del historial.')
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