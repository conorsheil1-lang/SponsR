import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { DialogService } from '../../core/dialog.service';
import { creatorProposals } from '../../core/creator-workspace-data';

@Component({
  selector: 'app-proposals',
  standalone: true,
  template: `
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
    </section>
  `
})
export class ProposalsComponent {
  private readonly dialogs = inject(DialogService);
  protected readonly proposals = creatorProposals;

  protected showProposal(proposal: (typeof creatorProposals)[number]): void {
    this.dialogs.openProposal(proposal);
  }
}
