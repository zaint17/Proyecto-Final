import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const toast = inject(ToastService);
  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      // 1. Si el token expiró o es inválido (401), se limpia la sesión obligatoriamente
      if (err.status === 401) {
        toast.error('Sesión expirada o inválida. Inicia sesión nuevamente.');
        auth.logout();
      }
      
      // 2. Si solo es falta de permisos (403), le avisamos pero NO le cerramos la sesión
      else if (err.status === 403) {
        toast.error('No tienes permisos suficientes para acceder a este recurso.');
        // Aquí no llamamos a auth.logout(), el usuario permanece dentro del sistema.
      }
      
      return throwError(() => err);
    })
  );
};