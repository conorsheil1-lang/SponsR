import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SessionService } from './core/session.service';
import { creatorProposals } from './core/creator-workspace-data';
import { DialogService } from './core/dialog.service';
import { MarketplaceWorkspaceService } from './core/marketplace-workspace.service';
import { DialogHostComponent } from './shared/dialog-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DialogHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly session = inject(SessionService);
  private readonly dialogs = inject(DialogService);
  private readonly workspace = inject(MarketplaceWorkspaceService);
  protected readonly isPublicPage = signal(false);
  protected readonly pendingProposalCount = computed(() => {
    this.dialogs.proposalStatusVersion();
    const currentUser = this.session.currentUser();
    const creatorProposalsAwaitingResponse = creatorProposals.filter((proposal) =>
      proposal.status !== 'Accepted' && proposal.status !== 'Declined'
    ).length;
    const companyOffersAwaitingResponse = currentUser?.type === 'creator'
      ? this.workspace.companyProposals().filter((proposal) =>
          proposal.status === 'Sent'
          && (currentUser.accountId
            ? proposal.creatorId === currentUser.accountId
            : proposal.creatorName === currentUser.name)
        ).length
      : 0;
    return creatorProposalsAwaitingResponse + companyOffersAwaitingResponse;
  });

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
