import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TicketService } from '../../../core/services/ticket.service';
import { TicketEventsService } from '../../../core/services/ticket-events.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, ArrowLeft, Save, User, FileText, Tag } from 'lucide-angular';

interface Categoria { id: number; nombre: string; }

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './ticket-form.html',
})
export class TicketForm implements OnInit {

  readonly ArrowLeft = ArrowLeft;
  readonly Save      = Save;
  readonly User      = User;
  readonly FileText  = FileText;
  readonly Tag       = Tag;

  categorias = signal<Categoria[]>([]);
  cargando   = signal(false);
  error      = signal('');
  
  // Guardar archivo físico capturado en el input de Entrada
  videoEntradaFile = signal<File | null>(null);

  form = {
    titulo: '', descripcion: '',
    cliente_nombre: '', cliente_dni: '',
    cliente_telefono: '', cliente_direccion: '',
    cliente_email: '', categoria_id: 0
  };

  constructor(
    private ticketService: TicketService,
    private ticketEvents: TicketEventsService,
    private toast: ToastService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/categorias`).subscribe({
      next: data => this.categorias.set(data),
      error: () => this.categorias.set([
        { id: 1, nombre: 'Hardware' }, { id: 2, nombre: 'Software' },
        { id: 3, nombre: 'Red' },      { id: 4, nombre: 'Otros' },
      ])
    });
  }

  onVideoEntradaSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.videoEntradaFile.set(file);
    }
  }

  guardar() {
    if (!this.form.titulo || !this.form.descripcion ||
        !this.form.cliente_nombre || !Number(this.form.categoria_id)) {
      this.error.set('Completa los campos obligatorios (*).');
      return;
    }
    this.cargando.set(true);
    this.error.set('');

    // Paso 1: Crear la entidad del ticket
    this.ticketService.crear({ ...this.form, categoria_id: Number(this.form.categoria_id) }).subscribe({
      next: (res: any) => {
        const ticketId = res.data.id;
        const file = this.videoEntradaFile();

        // Paso 2: Si el operador cargó un archivo binario, lo subimos enlazándolo al ID obtenido
        if (file) {
          this.ticketService.subirVideoLocal(ticketId, file, 'entrada' as any).subscribe({
            next: () => {
              this.finalizarCreacion();
            },
            error: () => {
              this.cargando.set(false);
              this.toast.error('Ticket creado, pero la evidencia multimedia local falló al guardarse.');
              this.router.navigate(['/app/tickets']);
            }
          });
        } else {
          this.finalizarCreacion();
        }
      },
      error: err => {
        this.cargando.set(false);
        this.error.set(err.error?.error || 'Error al crear el ticket.');
      }
    });
  }

  private finalizarCreacion() {
    this.ticketEvents.emitirTicketCreado(); 
    this.toast.success('Ticket creado correctamente con evidencia de entrada.');
    this.router.navigate(['/app/tickets']);
  }
}