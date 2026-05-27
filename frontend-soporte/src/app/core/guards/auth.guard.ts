import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.logueado()) {
    router.navigate(['/']);
    return false;
  }

  // Verificar si el token JWT expiró
  const token = auth.getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirado = payload.exp * 1000 < Date.now();
      if (expirado) {
        auth.logout();
        router.navigate(['/']);
        return false;
      }
    } catch {
      auth.logout();
      router.navigate(['/']);
      return false;
    }
  }

  return true;
};

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.esAdmin()) return true;

  router.navigate(['/app/dashboard']);
  return false;
};