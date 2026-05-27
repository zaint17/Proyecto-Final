import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';
import { ToastComponent } from '../../core/components/toast';
import { LucideAngularModule, Menu } from 'lucide-angular';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Navbar, ToastComponent, LucideAngularModule],
  template: `
    <div class="flex h-screen overflow-hidden" style="background:var(--bg)">

      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-20 bg-black/60 md:hidden"
             (click)="sidebarOpen.set(false)"></div>
      }

      <div class="fixed inset-y-0 left-0 z-30 transition-transform duration-300 md:static md:translate-x-0"
           [class.-translate-x-full]="!sidebarOpen()"
           [class.translate-x-0]="sidebarOpen()">
        <app-sidebar (closeSidebar)="sidebarOpen.set(false)"></app-sidebar>
      </div>

      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <app-navbar (toggleSidebar)="sidebarOpen.set(!sidebarOpen())"></app-navbar>
        <main class="flex-1 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>

    <!-- Toast global -->
    <app-toast></app-toast>
  `,
})
export class MainLayout {
  sidebarOpen = signal(false);
}