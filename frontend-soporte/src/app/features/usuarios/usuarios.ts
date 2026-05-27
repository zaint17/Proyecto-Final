import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService, Tecnico } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { LucideAngularModule, Users, Wrench, Plus, X, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [LucideAngularModule, FormsModule],
  templateUrl: 'usuarios.html',
})
export class Usuarios implements OnInit {
  readonly Users  = Users;
  readonly Wrench = Wrench;
  readonly Plus   = Plus;
  readonly X      = X;
  readonly Eye    = Eye;
  readonly EyeOff = EyeOff;

  tecnicos      = signal<Tecnico[]>([]);
  cargando      = signal(true);
  modalAbierto  = signal(false);
  guardando     = signal(false);
  showPassword  = signal(false);

  form = { nombre: '', email: '', password: '' };
  errorForm = signal('');

  constructor(
    private userService: UserService,
    private toast: ToastService
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.userService.getTecnicos().subscribe({
      next: res => { this.tecnicos.set(res.data); this.cargando.set(false); },
      error: ()  => this.cargando.set(false)
    });
  }

  abrirModal() {
    this.form = { nombre: '', email: '', password: '' };
    this.errorForm.set('');
    this.showPassword.set(false);
    this.modalAbierto.set(true);
  }

  guardar() {
    if (!this.form.nombre || !this.form.email || !this.form.password) {
      this.errorForm.set('Todos los campos son obligatorios.');
      return;
    }
    if (this.form.password.length < 6) {
      this.errorForm.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    this.guardando.set(true);
    this.errorForm.set('');
    this.userService.crearTecnico(this.form).subscribe({
      next: res => {
        this.tecnicos.update(t => [...t, res.data]);
        this.modalAbierto.set(false);
        this.guardando.set(false);
        this.toast.success('Técnico registrado correctamente');
      },
      error: err => {
        this.guardando.set(false);
        this.errorForm.set(err.error?.error || 'Error al registrar técnico.');
      }
    });
  }
}