import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Tecnico {
  id: number;
  nombre: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private url = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getTecnicos() {
    return this.http.get<{ data: Tecnico[] }>(`${this.url}/tecnicos`);
  }

  getUsuarios() {
    return this.http.get<{ data: Tecnico[] }>(this.url);
  }
}
