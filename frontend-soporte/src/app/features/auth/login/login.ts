import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Eye, EyeOff, LogIn, Headset } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './login.html',
})
export class Login {

  readonly Eye     = Eye;
  readonly EyeOff  = EyeOff;
  readonly LogIn   = LogIn;
  readonly Headset = Headset;

  features = [
    { icon: '🎫', text: 'Gestión centralizada de tickets' },
    { icon: '⚡', text: 'Asignación rápida a técnicos' },
    { icon: '📊', text: 'Dashboard con métricas en tiempo real' },
  ];

  showPassword = signal(false);
  email        = signal('');
  password     = signal('');
  cargando     = signal(false);
  error        = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.error.set('');
    if (!this.email() || !this.password()) {
      this.error.set('Por favor completa todos los campos.');
      return;
    }
    this.cargando.set(true);
    this.authService.login(this.email(), this.password()).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.error?.error || 'Error al iniciar sesión.');
      }
    });
  }
}
