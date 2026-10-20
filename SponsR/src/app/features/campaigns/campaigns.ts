import { Component, computed, signal } from '@angular/core';
import { campaignRecords } from '../../core/mock-data';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  template: `
    <section class="feature-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Campaigns</p>
          <h2>Deal lifecycle and approvals</h2>
        </div>
        <button class="ghost-button">Create brief</button>
      </div>

      <div class="campaign-grid">
        @for (campaign of campaigns(); track campaign.name) {
          <article class="campaign-card" [class.selected]="selectedCampaign() === campaign.name" (click)="selectCampaign(campaign.name)">
            <div class="card-head">
              <div>
                <p>{{ campaign.name }}</p>
                <strong>{{ campaign.brand }}</strong>
              </div>
              <span class="badge">{{ campaign.status }}</span>
            </div>

            <div class="timeline">
              @for (step of campaign.milestones; track step.label) {
                <div class="timeline-item" [class.done]="step.complete">
                  <span class="dot"></span>
                  <div>
                    <strong>{{ step.label }}</strong>
                    <small>{{ step.detail }}</small>
                  </div>
                </div>
              }
            </div>

            <div class="footer-row">
              <span>{{ campaign.amount }}</span>
              <button class="secondary-button" type="button">View details</button>
            </div>
          </article>
        }
      </div>

      <article class="panel-card summary-card">
        <div class="summary-header">
          <div>
            <p class="small-label">Selected deal</p>
            <h3>{{ activeCampaign().name }}</h3>
          </div>
          <span class="badge">{{ activeCampaign().status }}</span>
        </div>
        <p>{{ activeCampaign().brand }} • {{ activeCampaign().amount }}</p>
        <div class="summary-progress">
          <span [style.width.%]="(activeCampaign().milestones.filter((step) => step.complete).length / activeCampaign().milestones.length) * 100"></span>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .feature-panel {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .panel-header,
      .card-head,
      .footer-row,
      .timeline-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .panel-header {
        gap: 1rem;
      }
      .eyebrow {
        margin: 0 0 0.35rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.72rem;
        color: #7cc9ff;
      }
      h2 {
        margin: 0;
      }
      .ghost-button,
      .secondary-button {
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.6);
        color: #e2ecff;
        padding: 0.7rem 1rem;
        cursor: pointer;
      }
      .campaign-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
      }
      .campaign-card {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 20px;
        padding: 1rem 1.1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        cursor: pointer;
        transition: border-color 0.2s ease, transform 0.2s ease;
      }
      .campaign-card.selected {
        border-color: rgba(34, 211, 238, 0.8);
        transform: translateY(-1px);
      }
      .card-head {
        align-items: flex-start;
      }
      .card-head p,
      .timeline-item small,
      .footer-row span {
        color: #9fb0d4;
      }
      .card-head p,
      .card-head strong {
        margin: 0;
      }
      .badge {
        background: rgba(34, 211, 238, 0.2);
        color: #7dd3fc;
        padding: 0.35rem 0.6rem;
        border-radius: 999px;
        font-size: 0.72rem;
      }
      .timeline {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }
      .timeline-item {
        justify-content: flex-start;
        gap: 0.75rem;
        padding: 0.5rem 0;
      }
      .timeline-item.done strong {
        color: #6ee7b7;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #7c3aed;
        box-shadow: 0 0 0 5px rgba(124, 58, 237, 0.2);
      }
      .timeline-item.done .dot {
        background: #10b981;
        box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.15);
      }
      .timeline-item strong,
      .timeline-item small {
        display: block;
      }
      .footer-row {
        border-top: 1px solid rgba(148, 163, 184, 0.12);
        padding-top: 0.8rem;
      }
      .footer-row span {
        font-weight: 700;
        color: #e2ecff;
      }
      .summary-card {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }
      .summary-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
      }
      .small-label {
        margin: 0 0 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.68rem;
        color: #8ca5cd;
      }
      .summary-progress {
        width: 100%;
        height: 10px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.15);
        overflow: hidden;
      }
      .summary-progress span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
      }
    `
  ]
})
export class CampaignsComponent {
  readonly campaigns = signal(campaignRecords);
  readonly selectedCampaign = signal(campaignRecords[0].name);

  readonly activeCampaign = computed(() =>
    this.campaigns().find((campaign) => campaign.name === this.selectedCampaign()) ?? this.campaigns()[0]
  );

  selectCampaign(name: string): void {
    this.selectedCampaign.set(name);
  }
}
