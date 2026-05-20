import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guard funcional (Angular 17+)
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.logueado()) return true;

  router.navigate(['/']);
  return false;
};

// Guard para rutas exclusivas de admin
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.esAdmin()) return true;

  // Si está logueado pero no es admin, redirige al dashboard
  router.navigate(['/app/dashboard']);
  return false;
};
