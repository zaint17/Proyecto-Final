import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  cliente: string;
  cliente_email: string;
  cliente_telefono: string;
  tecnico: string | null;
  estado: string;
  estado_id: number;
  prioridad: string;
  categoria: string;
  fecha_creacion: string;
  fecha_limite: string;
  fecha_actualizacion: string | null;
  video_url: string | null;
}

export interface TicketDetalle extends Ticket {
  cliente_dni: string;
  cliente_nombre: string;
  cliente_direccion: string;
}

export interface CrearTicketDto {
  titulo: string;
  descripcion: string;
  cliente_nombre: string;
  cliente_dni?: string;
  cliente_telefono?: string;
  cliente_direccion?: string;
  cliente_email?: string;
  categoria_id: number;
  video_url?: string;
}

@Injectable({ providedIn: 'root' })
export class TicketService {

  private url = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  // Listar todos
  getTickets() {
    return this.http.get<{ data: Ticket[]; total: number }>(this.url);
  }

  // Detalle completo
  getDetalle(id: number) {
    return this.http.get<{ data: TicketDetalle }>(`${this.url}/${id}/detalle`);
  }

  // Crear
  crear(dto: CrearTicketDto) {
    return this.http.post<{ data: Ticket; message: string }>(this.url, dto);
  }

  // Asignar técnico (solo admin)
  asignarTecnico(ticketId: number, tecnico_id: number) {
    return this.http.put<{ data: Ticket; message: string }>(
      `${this.url}/${ticketId}/asignar`,
      { tecnico_id }
    );
  }

  // Cambiar estado
  cambiarEstado(ticketId: number, estado_id: number) {
    return this.http.put<{ data: Ticket; message: string }>(
      `${this.url}/${ticketId}/estado`,
      { estado_id }
    );
  }

  // Obtener ticket por ID (Simple)
  getTicketById(id: number) {
    return this.http.get<{ data: Ticket }>(
      `${this.url}/${id}`
    );
  }

  // Registrar el envío en el historial
  registrarNotificacion(ticketId: number, mensaje: string) {
    return this.http.post(`${this.url}/${ticketId}/notificar`, { mensaje });
  }

  // Obtener el historial para pintarlo en la vista de detalles
  getHistorialNotificaciones(ticketId: number) {
    return this.http.get<{ data: any[] }>(
      `${this.url}/${ticketId}/notificaciones`
    );
  }

  getHistorialGlobal() {
    return this.http.get<{ data: any[] }>(
      `${environment.apiUrl}/notificaciones-globales`
    );
  }
}
