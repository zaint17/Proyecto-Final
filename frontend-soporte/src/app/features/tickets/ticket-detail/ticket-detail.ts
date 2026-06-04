import { Component, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TicketService, TicketDetalle } from '../../../core/services/ticket.service';
import { RespuestaService, Respuesta } from '../../../core/services/respuesta.service';
import { UserService, Tecnico } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  LucideAngularModule, ArrowLeft, User, Wrench, Video,
  MessageSquare, Send, UserCheck, RefreshCw, Bell
} from 'lucide-angular';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, LucideAngularModule],
  templateUrl: './ticket-detail.html',
})
export class TicketDetail implements OnInit {

  readonly ArrowLeft     = ArrowLeft;
  readonly User          = User;
  readonly Wrench        = Wrench;
  readonly MessageSquare = MessageSquare;
  readonly Send          = Send;
  readonly UserCheck     = UserCheck;
  readonly RefreshCw     = RefreshCw;
  readonly Bell          = Bell;
  readonly Video         = Video;

  ticket     = signal<TicketDetalle | null>(null);
  respuestas = signal<Respuesta[]>([]);
  tecnicos   = signal<Tecnico[]>([]);
  historialNotificaciones = signal<any[]>([]); 
  cargando   = signal(true);
  error      = signal('');
  nuevoMsg   = signal('');
  enviando   = signal(false);

  videoSalida    = signal<File | null>(null);
  subiendoVideo  = signal(false);

  tecnicoSeleccionado = signal<number | null>(null);
  estadoSeleccionado  = signal<number | null>(null);

  videoEntradaSafeUrl = computed<SafeUrl | null>(() => {
    const t = this.ticket();
    if (!t || !t.video_url) return null;
    
    const pathLimpio = t.video_url.replace(/^\/+/, ''); 
    return this.sanitizer.bypassSecurityTrustUrl(`http://localhost:3000/${pathLimpio}`);
  });

  estados = [
    { id: 1, nombre: 'Abierto' },
    { id: 2, nombre: 'En progreso' },
    { id: 4, nombre: 'Cerrado' },
  ];

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private respuestaService: RespuestaService,
    private userService: UserService,
    private toast: ToastService,
    private sanitizer: DomSanitizer,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarTicket(id);
    this.cargarRespuestas(id);
    this.cargarHistorial(id);
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
    if (!msg || !this.ticket() || this.ticket()!.estado_id === 4) return;
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

  onVideoSalidaSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.videoSalida.set(file);
    }
  }

  subirVideoSalida() {
    const file = this.videoSalida();
    const currentTicket = this.ticket();
    if (!file || !currentTicket) return;

    this.subiendoVideo.set(true);
    this.ticketService.subirVideoLocal(currentTicket.id, file, 'salida' as any).subscribe({
      next: () => {
        this.subiendoVideo.set(false);
        this.videoSalida.set(null);
        this.toast.success('Evidencia de salida guardada en el servidor.');
        this.cargarRespuestas(currentTicket.id);
        this.cargarHistorial(currentTicket.id);
      },
      error: () => {
        this.subiendoVideo.set(false);
        this.toast.error('Error al subir video local.');
      }
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
    const estadoIdActual = this.estadoSeleccionado();
    const currentTicket = this.ticket();

    if (!estadoIdActual || !currentTicket) return;

    this.ticketService.cambiarEstado(currentTicket.id, estadoIdActual).subscribe({
      next: res => {
        this.ticket.set({ ...currentTicket, ...res.data });
        this.toast.success('Estado operativo actualizado.');

        // 🚀 ACCIÓN HÍBRIDA: Si se cierra el ticket, disparamos la pestaña de WhatsApp
        if (Number(estadoIdActual) === 4 && currentTicket.cliente_telefono) {
          
          // Construimos el mensaje formateado limpiamente
          const textoMensaje = 
            `Hola ${currentTicket.cliente_nombre || 'Cliente'}, te saludamos de Distribuidora LURESA. ` +
            `Te informamos que tu requerimiento de soporte técnico con código #${currentTicket.id} ` +
            `(${currentTicket.titulo || 'PC'}) ya se encuentra SOLUCIONADO y listo para recoger. ` +
            `¡Gracias por tu preferencia!`;

          // Limpiamos caracteres especiales para la URL
          const mensajeCodificado = encodeURIComponent(textoMensaje);
          
          // Concatenamos el prefijo de Perú (51) de manera segura
          const urlWhatsApp = `https://api.whatsapp.com/send?phone=51${currentTicket.cliente_telefono}&text=${mensajeCodificado}`;
          
          // Abrimos el navegador en una pestaña limpia
          window.open(urlWhatsApp, '_blank');
        }

        // Refrescamos inmediatamente el "Historial de Alertas" en pantalla
        this.cargarHistorial(currentTicket.id);
      },
      error: () => this.toast.error('Error al cambiar estado')
    });
  }

  chipClass(estado: string): string {
    const m: Record<string, string> = {
      'Abierto': 'open', 'En progreso': 'progress', 'Cerrado': 'closed'
    };
    return 'chip ' + (m[estado] ?? 'closed');
  }

  esTecnico(rol_id: number): boolean { return rol_id === 2; }

  obtenerSafeUrlDesdeMensaje(mensaje: string): SafeUrl {
    const rutaRelativa = mensaje.replace('[EVIDENCIA DE SALIDA] Video adjunto:', '').trim();
    const pathLimpio = rutaRelativa.replace(/^\/+/, ''); 
    return this.sanitizer.bypassSecurityTrustUrl(`http://localhost:3000/${pathLimpio}`);
  }

  // 🛠️ FUNCIÓN PREMIUM: Despliega el contenido exacto enviado por la API de WhatsApp
  abrirModalMensaje(textoMensaje: string) {
    alert(`💬 DETALLE DEL MENSAJE ENVIADO VÍA WHATSAPP API:\n\n"${textoMensaje}"`);
  }
}