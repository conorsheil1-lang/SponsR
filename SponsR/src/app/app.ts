import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SessionService } from './core/session.service';
import { DialogHostComponent } from './shared/dialog-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DialogHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly session = inject(SessionService);
  protected readonly isPublicPage = signal(false);

  constructor(private readonly router: Router) {
    this.isPublicPage.set(this.isPublicRoute(this.router.url));

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isPublicPage.set(this.isPublicRoute(event.urlAfterRedirects));
      });
  }

  private isPublicRoute(url: string): boolean {
    return url === '/' || url.startsWith('/login') || url.startsWith('/signup');
  }

  protected signOut(): void {
    this.session.signOut();
    void this.router.navigateByUrl('/');
  }

  protected getUserInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('');
  }
}
