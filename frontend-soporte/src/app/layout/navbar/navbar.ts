import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, Plus, Menu } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>();

  readonly Plus = Plus;
  readonly Menu = Menu;

  constructor(public auth: AuthService) {}
}
