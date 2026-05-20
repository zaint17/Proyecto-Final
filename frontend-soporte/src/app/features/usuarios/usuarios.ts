import { Component, signal, OnInit } from '@angular/core';
import { UserService, Tecnico } from '../../core/services/user.service';
import { LucideAngularModule, Users, Wrench } from 'lucide-angular';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
  <div class="p-4 sm:p-6 lg:p-8" style="max-width:100%">

    <div class="mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-2 mb-1">
        <lucide-icon [img]="Users" size="22" aria-hidden="true" style="color:var(--accent)"></lucide-icon>
        Técnicos
      </h1>
      <p class="text-sm" style="color:var(--muted)">Equipo técnico registrado en el sistema</p>
    </div>

    @if (cargando()) {
      <div class="text-center py-20 text-lg" style="color:var(--muted)">Cargando...</div>
    }

    <div class="card p-0 overflow-hidden w-full">
      <div class="overflow-x-auto">
        <table class="tbl" style="min-width:500px">
          <thead>
            <tr>
              <th style="width:70px">#</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            @for (u of tecnicos(); track u.id) {
              <tr style="cursor:default">
                <td style="color:var(--muted);font-size:13px">#{{ u.id }}</td>
                <td>
                  <div class="flex items-center gap-3">
                    <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;font-family:'Syne',sans-serif">
                      {{ u.nombre.slice(0,2).toUpperCase() }}
                    </div>
                    <span style="font-weight:500;font-size:15px">{{ u.nombre }}</span>
                  </div>
                </td>
                <td style="color:var(--muted);font-size:14px">{{ u.email }}</td>
                <td>
                  <span style="background:#F59E0B20;color:#FCD34D;border:1px solid #F59E0B30;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;display:inline-flex;align-items:center;gap:5px">
                    <lucide-icon [img]="Wrench" size="11" aria-hidden="true"></lucide-icon>
                    Técnico
                  </span>
                </td>
              </tr>
            }
            @if (tecnicos().length === 0 && !cargando()) {
              <tr><td colspan="4" class="text-center py-16" style="color:var(--muted);font-size:15px">
                Sin técnicos registrados
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

  </div>
`,
})
export class Usuarios implements OnInit {
  readonly Users  = Users;
  readonly Wrench = Wrench;

  tecnicos = signal<Tecnico[]>([]);
  cargando = signal(true);

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getTecnicos().subscribe({
      next: res => { this.tecnicos.set(res.data); this.cargando.set(false); },
      error: ()  => this.cargando.set(false)
    });
  }
}
