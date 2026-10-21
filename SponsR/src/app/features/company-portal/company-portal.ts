import { Component, inject, signal } from '@angular/core';
import { DialogService } from '../../core/dialog.service';

@Component({
  selector: 'app-company-portal',
  standalone: true,
  template: `
    <section class="portal-page">
      <div class="portal-banner">
        <div>
          <p class="eyebrow">Company portal</p>
          <h2>Find creators, launch campaign briefs, and review proposals</h2>
        </div>
        <div class="portal-actions">
          <button class="primary-button" type="button" (click)="createJob()">Create job</button>
          <button class="secondary-button" type="button" (click)="createCampaign()">Create campaign</button>
        </div>
      </div>

      <div class="stats-grid">
        @for (stat of stats(); track stat.label) {
          <article class="stat-card">
            <span>{{ stat.label }}</span>
            <strong>{{ stat.value }}</strong>
          </article>
        }
      </div>

      <div class="content-grid">
        <article class="panel-card">
          <div class="panel-heading">
            <h3>Potential sponsorship matches</h3>
            <button type="button" class="show-more-button" (click)="viewCreatorMatches()">View all</button>
          </div>
          <ul>
            @for (creator of creatorMatches().slice(0, 3); track creator.name) {
              <li><strong>{{ creator.name }}</strong><span>{{ creator.meta }}</span></li>
            }
          </ul>
        </article>

        <article class="panel-card">
          <div class="panel-heading">
            <h3>Active campaigns</h3>
            <button type="button" class="show-more-button" (click)="viewActiveCampaigns()">View all</button>
          </div>
          <ul>
            @for (campaign of activeCampaigns().slice(0, 3); track campaign.name) {
              <li><strong>{{ campaign.name }}</strong><span>{{ campaign.status }}</span></li>
            }
          </ul>
        </article>

        <article class="panel-card wide">
          <h3>Discovery board</h3>
          <ul>
            <li><strong>Creator fit</strong><span>Beauty, gaming, travel, wellness</span></li>
            <li><strong>Proposal pipeline</strong><span>13 shortlisted, 5 awaiting review</span></li>
            <li><strong>Budget</strong><span>$92K committed for Q4 campaigns</span></li>
          </ul>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .portal-page {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .portal-banner,
      .stats-grid,
      .content-grid {
        display: grid;
        gap: 1rem;
      }
      .portal-banner {
        grid-template-columns: 1fr auto;
        align-items: center;
        background: #e9eedf;
        border: 1px solid #e0e7d6;
        border-radius: 22px;
        padding: 1.2rem 1.3rem;
      }
      .portal-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }
      .eyebrow {
        margin: 0 0 0.35rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.7rem;
        color: #7cc9ff;
      }
      h2, h3 {
        margin: 0;
      }
      .primary-button {
        border: none;
        border-radius: 999px;
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
        color: white;
        padding: 0.8rem 1rem;
        cursor: pointer;
      }
      .secondary-button {
        border: 1px solid #dfe7d8;
        border-radius: 999px;
        background: #fff;
        color: #405240;
        padding: 0.8rem 1rem;
        cursor: pointer;
      }
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      }
      .stat-card,
      .panel-card {
        background: #fff;
        border: 1px solid #e6e9e1;
        border-radius: 18px;
        padding: 1rem 1.1rem;
        box-shadow: 0 8px 24px rgba(48, 65, 43, 0.035);
      }
      .stat-card {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .stat-card span,
      .panel-card li span,
      .panel-card li {
        color: #748078;
      }
      .stat-card strong {
        color: #26382b;
        font-size: 2rem;
      }
      .panel-card h3 {
        color: #26382b;
        font-size: 1rem;
      }
      .panel-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.9rem;
      }
      .content-grid {
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      }
      .wide {
        grid-column: 1 / -1;
      }
      .panel-card ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }
      .panel-card li {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        border: 1px solid #e9ede4;
        background: #f8f9f6;
        border-radius: 12px;
        padding: 0.8rem 0.9rem;
      }
      .panel-card li strong {
        color: #26382b;
      }
      .show-more-button {
        margin-top: 0.8rem;
        padding: 0.35rem 0;
        border: 0;
        background: transparent;
        color: #557842;
        cursor: pointer;
        font: inherit;
        font-size: 0.76rem;
        font-weight: 700;
      }
      .show-more-button:hover {
        color: #294432;
        text-decoration: underline;
      }
    `
  ]
})
export class CompanyPortalComponent {
  private readonly dialogs = inject(DialogService);
  readonly creatorMatches = signal([
    { name: 'Nova Frame', meta: 'Tech creator · 240K reach' },
    { name: 'Rift Rush', meta: 'Gaming creator · 420K reach' },
    { name: 'Cora Content', meta: 'Finance creator · 180K reach' },
    { name: 'Maya Patel', meta: 'Interiors creator · 327K reach' },
    { name: 'Amara Jones', meta: 'Fitness creator · 183K reach' }
  ]);
  readonly activeCampaigns = signal([
    { name: 'Northstar Labs', status: 'Escrow funded' },
    { name: 'Velora Health', status: 'Draft in review' },
    { name: 'SparkPilot', status: 'Waiting for brief approval' },
    { name: 'Morrow', status: 'Creator applications open' },
    { name: 'Trailhead Supply', status: 'Shortlist ready to review' }
  ]);
  readonly stats = signal([
    { label: 'Campaigns', value: '14' },
    { label: 'Creators shortlisted', value: '27' },
    { label: 'Escrow funded', value: '$84K' },
    { label: 'Approval rate', value: '92%' }
  ]);

  createJob(): void {
    this.dialogs.openCreateJob();
  }

  createCampaign(): void {
    this.dialogs.openCreateCampaign();
  }

  viewCreatorMatches(): void {
    this.dialogs.openList(
      'Potential sponsorship matches',
      'Creators whose audience and content may fit your upcoming campaigns.',
      this.creatorMatches().map((creator) => ({ title: creator.name, subtitle: creator.meta })),
      'CREATOR DISCOVERY'
    );
  }

  viewActiveCampaigns(): void {
    this.dialogs.openList(
      'Active campaigns',
      'Review your current campaign activity and status.',
      this.activeCampaigns().map((campaign) => ({ title: campaign.name, subtitle: campaign.status })),
      'COMPANY WORKSPACE'
    );
  }
}
