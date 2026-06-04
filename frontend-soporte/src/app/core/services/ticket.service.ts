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

  getTickets() {
    return this.http.get<{ data: Ticket[]; total: number }>(this.url);
  }

  getDetalle(id: number) {
    return this.http.get<{ data: TicketDetalle }>(`${this.url}/${id}/detalle`);
  }

  crear(dto: CrearTicketDto) {
    return this.http.post<{ data: Ticket; message: string }>(this.url, dto);
  }

  asignarTecnico(ticketId: number, tecnico_id: number) {
    return this.http.put<{ data: Ticket; message: string }>(
      `${this.url}/${ticketId}/asignar`,
      { tecnico_id }
    );
  }

  cambiarEstado(ticketId: number, estado_id: number) {
    return this.http.put<{ data: Ticket; message: string }>(
      `${this.url}/${ticketId}/estado`,
      { estado_id }
    );
  }

  getTicketById(id: number) {
    return this.http.get<{ data: Ticket }>(
      `${this.url}/${id}`
    );
  }

  // NUEVO: Envío del archivo de video como binario Multipart
  subirVideoLocal(ticketId: number, file: File, tipo: 'entrada' | 'salida') {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('tipo', tipo);

    return this.http.post<{ data: { video_url: string }; message: string }>(
      `${this.url}/${ticketId}/upload-video`, 
      formData
    );
  }

  registrarNotificacion(ticketId: number, mensaje: string) {
    return this.http.post(`${this.url}/${ticketId}/notificar`, { mensaje });
  }

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