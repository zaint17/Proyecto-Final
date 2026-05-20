import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Respuesta {
  id: number;
  ticket_id: number;
  usuario: string;
  rol_id: number;
  mensaje: string;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class RespuestaService {

  private url = `${environment.apiUrl}/respuestas`;

  constructor(private http: HttpClient) {}

  getRespuestas(ticket_id: number) {
    return this.http.get<{ data: Respuesta[] }>(`${this.url}/${ticket_id}`);
  }

  enviar(ticket_id: number, mensaje: string) {
    return this.http.post<{ data: Respuesta; message: string }>(
      this.url,
      { ticket_id, mensaje }
    );
  }
}
