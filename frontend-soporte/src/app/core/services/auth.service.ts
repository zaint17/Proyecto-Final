import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: number; // 1 = admin, 2 = tecnico
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'luresa_token';
  private readonly USER_KEY  = 'luresa_user';

  // Estado reactivo
  private _usuario = signal<Usuario | null>(this.cargarUsuario());
  private _token   = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  // Expuestos como readonly
  usuario  = this._usuario.asReadonly();
  token    = this._token.asReadonly();
  logueado = computed(() => !!this._token());
  esAdmin  = computed(() => this._usuario()?.rol === 1);

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login ────────────────────────────────────────────────────────────────────
  login(email: string, password: string) {
    return this.http.post<{ token: string; user: Usuario }>(
      `${environment.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this._token.set(res.token);
        this._usuario.set(res.user);
      })
    );
  }

  // ── Logout ───────────────────────────────────────────────────────────────────
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._usuario.set(null);
    this.router.navigate(['/']);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  getToken(): string | null {
    return this._token();
  }

  private cargarUsuario(): Usuario | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
