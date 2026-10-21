import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { creatorCampaigns, creatorDeadlines, creatorNotifications, creatorProposals } from '../../core/creator-workspace-data';
import { DialogService } from '../../core/dialog.service';
import { SessionService } from '../../core/session.service';

@Component({
  selector: 'app-creator-overview',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="creator-dashboard">
      <header class="creator-welcome">
        <div>
          <p class="eyebrow">CREATOR WORKSPACE</p>
          <h2>Good to see you, {{ firstName() }}.</h2>
          <p>Here’s what’s happening with your partnerships.</p>
        </div>
        <a routerLink="/discovery" class="dashboard-action">Find opportunities <span aria-hidden="true">↗</span></a>
      </header>

      <section class="creator-metrics" aria-label="Creator account summary">
        <article class="creator-metric accent">
          <span>Campaign activity</span>
          <strong>{{ campaigns.length }}</strong>
          <small>{{ activeCampaignCount }} active · {{ campaigns.length - activeCampaignCount }} shortlisted</small>
        </article>
        <article class="creator-metric">
          <span>Open proposals</span>
          <strong>{{ openProposalCount }}</strong>
          <small>{{ shortlistedCount }} shortlisted</small>
        </article>
        <article class="creator-metric">
          <span>Upcoming deadlines</span>
          <strong>{{ deadlines.length }}</strong>
          <small>{{ dueSoonCount }} due in the next day</small>
        </article>
        <article class="creator-metric">
          <span>Next payout</span>
          <strong>$1,850</strong>
          <small>Goodfolk Coffee · processing</small>
        </article>
      </section>

      <div class="creator-dashboard-grid">
        <section class="dashboard-panel notifications-panel">
          <div class="dashboard-panel-heading">
            <div>
              <p class="eyebrow">STAY IN THE LOOP</p>
              <h3>Notifications <span class="notification-count">{{ notifications.length }}</span></h3>
            </div>
          </div>
          <ul class="dashboard-list notification-list">
            @for (notification of notifications; track notification.id) {
              <li>
                <span class="notification-dot" [class]="notification.kind" aria-hidden="true"></span>
                <div class="list-copy">
                  <strong>{{ notification.title }}</strong>
                  <span>{{ notification.detail }}</span>
                </div>
                <time>{{ notification.time }}</time>
              </li>
            }
          </ul>
        </section>

        <section class="dashboard-panel deadlines-panel">
          <div class="dashboard-panel-heading">
            <div>
              <p class="eyebrow">WHAT’S NEXT</p>
              <h3>Upcoming deadlines</h3>
            </div>
            <button class="dashboard-view-action" type="button" (click)="showAllDeadlines()">View all</button>
          </div>
          <ul class="dashboard-list">
            @for (deadline of deadlines.slice(0, 3); track deadline.id) {
              <li>
                <span class="deadline-date" [class.due-soon]="deadline.daysRemaining <= 1">{{ deadline.dueDate }}</span>
                <div class="list-copy">
                  <strong>{{ deadline.task }}</strong>
                  <span>{{ deadline.campaign }}</span>
                </div>
              </li>
            }
          </ul>
        </section>

        <section class="dashboard-panel proposals-panel">
          <div class="dashboard-panel-heading">
            <div>
              <p class="eyebrow">YOUR PITCHES</p>
              <h3>Recent proposals</h3>
            </div>
            <button class="dashboard-view-action" type="button" (click)="showAllProposals()">View all</button>
          </div>
          <ul class="dashboard-list proposal-list">
            @for (proposal of proposals.slice(0, 3); track proposal.id) {
              <li>
                <div class="list-copy">
                  <strong>{{ proposal.campaign }}</strong>
                  <span>{{ proposal.brand }} · {{ proposal.amount }}</span>
                </div>
                <span class="proposal-status" [class]="proposal.status.toLowerCase().replace(' ', '-')">{{ proposal.status }}</span>
                <button class="row-detail-action" type="button" (click)="showProposal(proposal)">View</button>
              </li>
            }
          </ul>
        </section>

        <section class="dashboard-panel campaigns-panel">
          <div class="dashboard-panel-heading">
            <div>
              <p class="eyebrow">WORK IN MOTION</p>
              <h3>Campaigns</h3>
            </div>
            <button class="dashboard-view-action" type="button" (click)="showAllCampaigns()">View all</button>
          </div>
          <ul class="dashboard-list campaign-list">
            @for (campaign of campaigns; track campaign.id) {
              <li>
                <span class="campaign-mark">{{ campaign.brand.charAt(0) }}</span>
                <div class="list-copy">
                  <strong>{{ campaign.name }}</strong>
                  <span>{{ campaign.brand }} · {{ campaign.nextStep }}</span>
                </div>
                <span class="campaign-amount">{{ campaign.amount }}</span>
              </li>
            }
          </ul>
        </section>
      </div>
    </section>
  `
})
export class CreatorOverviewComponent {
  private readonly session = inject(SessionService);
  private readonly dialogs = inject(DialogService);
  protected readonly notifications = creatorNotifications;
  protected readonly proposals = creatorProposals;
  protected readonly deadlines = creatorDeadlines;
  protected readonly campaigns = creatorCampaigns.filter((campaign) =>
    creatorProposals.some((proposal) =>
      proposal.status === 'Accepted' &&
      proposal.campaign === campaign.name &&
      proposal.brand === campaign.brand
    )
  );
  protected readonly activeCampaignCount = this.campaigns.filter((campaign) => campaign.status !== 'Shortlisted').length;
  protected readonly openProposalCount = this.proposals.filter((proposal) => proposal.status !== 'Accepted').length;
  protected readonly shortlistedCount = this.proposals.filter((proposal) => proposal.status === 'Shortlisted').length;
  protected readonly dueSoonCount = this.deadlines.filter((deadline) => deadline.daysRemaining <= 1).length;

  protected firstName(): string {
    return this.session.currentUser()?.name.split(' ')[0] ?? 'creator';
  }

  protected showAllDeadlines(): void {
    this.dialogs.openList(
      'Upcoming deadlines',
      'Deadlines for your active creator partnerships.',
      this.deadlines.map((deadline) => ({
        title: deadline.task,
        subtitle: deadline.campaign,
        meta: `${deadline.dueDate} · ${deadline.priority}`
      })),
      'WHAT’S NEXT'
    );
  }

  protected showAllProposals(): void {
    this.dialogs.openList(
      'Your proposals',
      'Track the status of every proposal you have sent.',
      this.proposals.map((proposal) => ({
        title: proposal.campaign,
        subtitle: `${proposal.brand} · ${proposal.status}`,
        meta: proposal.amount
      })),
      'YOUR PITCHES'
    );
  }

  protected showAllCampaigns(): void {
    this.dialogs.openList(
      'Your campaigns',
      'Campaigns and creator partnerships currently in motion.',
      this.campaigns.map((campaign) => ({
        title: campaign.name,
        subtitle: `${campaign.brand} · ${campaign.status}`,
        meta: campaign.nextStep
      })),
      'WORK IN MOTION'
    );
  }

  protected showProposal(proposal: (typeof creatorProposals)[number]): void {
    this.dialogs.openProposal(proposal);
  }
}
