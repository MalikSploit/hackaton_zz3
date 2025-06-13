import { Component } from '@angular/core';
import { AuthService } from '../../_services/auth_service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  isMenuOpen = false;
  constructor(public auth: AuthService) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.auth.logout();
  }
}
