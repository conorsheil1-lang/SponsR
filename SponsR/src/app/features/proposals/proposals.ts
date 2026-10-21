import { Component, inject } from '@angular/core';
import { DialogService } from '../../core/dialog.service';
import { creatorProposals } from '../../core/creator-workspace-data';
import { MarketplaceWorkspaceService, type CompanyProposal } from '../../core/marketplace-workspace.service';
import { SessionService } from '../../core/session.service';

@Component({
  selector: 'app-proposals',
  standalone: true,
  template: `
    @if (isCompany) {
    <section class="creator-workspace-page">
      <header class="workspace-page-heading">
        <div>
          <p class="eyebrow">COMPANY WORKSPACE</p>
          <h2>Proposals to creators</h2>
          <p>Track proposals you’ve sent to creators from your job and campaign shortlists.</p>
        </div>
        <span class="page-count">{{ companyProposals().length }} sent</span>
      </header>

      <div class="proposal-cards">
        @for (proposal of companyProposals(); track proposal.id) {
          <article class="creator-workspace-card proposal-item">
            <div class="workspace-card-mark">{{ proposal.creatorName.charAt(0) }}</div>
            <div class="proposal-info">
              <h3>{{ proposal.creatorName }}</h3>
              <p>{{ proposal.opportunityTitle }} · Sent {{ formatDate(proposal.sentAt) }}</p>
            </div>
            <strong class="proposal-amount">{{ formatAmount(proposal.amount) }}</strong>
            <span class="proposal-status">{{ proposal.status }}</span>
            <button type="button" class="proposal-view-button" (click)="showCompanyProposal(proposal)">View proposal</button>
          </article>
        } @empty {
          <p class="workspace-empty">Proposals you send to creators will appear here.</p>
        }
      </div>
    </section>
    } @else {
      <section class="creator-workspace-page">
        <header class="workspace-page-heading">
          <div>
            <p class="eyebrow">CREATOR WORKSPACE</p>
            <h2>Your proposals</h2>
            <p>Keep track of the opportunities you’ve put your name forward for.</p>
          </div>
          <span class="page-count">{{ proposals.length }} proposals</span>
        </header>

        <div class="proposal-cards">
          @for (proposal of proposals; track proposal.id) {
            <article class="creator-workspace-card proposal-item">
              <div class="workspace-card-mark">{{ proposal.brand.charAt(0) }}</div>
              <div class="proposal-info">
                <h3>{{ proposal.campaign }}</h3>
                <p>{{ proposal.brand }} · Submitted {{ proposal.submitted }}</p>
              </div>
              <strong class="proposal-amount">{{ proposal.amount }}</strong>
              <span class="proposal-status" [class]="proposal.status.toLowerCase().replace(' ', '-')">{{ proposal.status }}</span>
              <button type="button" class="proposal-view-button" (click)="showProposal(proposal)">View proposal</button>
            </article>
          } @empty {
            <p class="workspace-empty">Your proposals will show here when you apply to a campaign.</p>
          }
        </div>
        <section class="received-proposals">
          <header class="workspace-page-heading">
            <div>
              <p class="eyebrow">BRAND OFFERS</p>
              <h2>Proposals sent to you</h2>
              <p>Review offers from companies and respond to the ones that fit.</p>
            </div>
            <span class="page-count">{{ receivedCompanyProposals().length }} received</span>
          </header>
          <div class="proposal-cards">
            @for (proposal of receivedCompanyProposals(); track proposal.id) {
              <article class="creator-workspace-card proposal-item">
                <div class="workspace-card-mark">{{ proposal.companyName.charAt(0) }}</div>
                <div class="proposal-info">
                  <h3>{{ proposal.companyName }} · {{ proposal.opportunityTitle }}</h3>
                  <p>Sent {{ formatDate(proposal.sentAt) }}</p>
                </div>
                <strong class="proposal-amount">{{ formatAmount(proposal.amount) }}</strong>
                <span class="proposal-status">{{ proposal.status }}</span>
                <button type="button" class="proposal-view-button" (click)="showReceivedProposal(proposal)">Review offer</button>
              </article>
            } @empty {
              <p class="workspace-empty">Company offers sent to you will appear here.</p>
            }
          </div>
        </section>
      </section>
    }
  `
})
export class ProposalsComponent {
  private readonly dialogs = inject(DialogService);
  private readonly session = inject(SessionService);
  private readonly workspace = inject(MarketplaceWorkspaceService);
  protected readonly isCompany = this.session.currentUser()?.type === 'company';
  protected readonly proposals = creatorProposals;
  protected readonly companyProposals = () =>
    this.workspace.companyProposals().filter((proposal) => proposal.companyName === this.session.currentUser()?.name);
  protected readonly receivedCompanyProposals = () => {
    const user = this.session.currentUser();
    return this.workspace.companyProposals().filter((proposal) =>
      user?.accountId ? proposal.creatorId === user.accountId : proposal.creatorName === user?.name
    );
  };

  protected showProposal(proposal: (typeof creatorProposals)[number]): void {
    this.dialogs.openProposal(proposal);
  }

  protected showCompanyProposal(proposal: CompanyProposal): void {
    this.dialogs.openCompanyProposal(proposal);
  }

  protected formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  }

  protected showReceivedProposal(proposal: CompanyProposal): void {
    this.dialogs.openCompanyProposal(proposal);
  }
}
