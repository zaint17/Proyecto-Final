import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, LayoutDashboard, Ticket, Users, LogOut, Headset } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  @Output() closeSidebar = new EventEmitter<void>();

  readonly LayoutDashboard = LayoutDashboard;
  readonly Ticket          = Ticket;
  readonly Users           = Users;
  readonly LogOut          = LogOut;
  readonly Headset         = Headset;

  constructor(public auth: AuthService) {}

  navegarY() { this.closeSidebar.emit(); }
}
