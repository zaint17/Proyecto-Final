import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // LOGIN — ruta pública
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login)
  },

  // SISTEMA — requiere login
  {
    path: 'app',
    loadComponent: () =>
      import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },

      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/tickets/ticket-list/ticket-list').then(m => m.TicketList)
      },

      {
        path: 'tickets/nuevo',
        loadComponent: () =>
          import('./features/tickets/ticket-form/ticket-form').then(m => m.TicketForm)
      },

      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./features/tickets/ticket-detail/ticket-detail').then(m => m.TicketDetail)
      },

      // Solo admin
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/usuarios/usuarios').then(m => m.Usuarios)
      },

    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }

];
