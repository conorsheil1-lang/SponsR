import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SponsR');
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
    return url === '/' || url.startsWith('/login');
  }
}
