import { TitleCasePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { paymentViews, payoutItems } from '../../core/mock-data';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [TitleCasePipe],
  template: `
    <section class="feature-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Payments & escrow</p>
          <h2>Wallet, escrow, and payouts</h2>
        </div>
        <button class="primary-button">Add payout method</button>
      </div>

      <div class="metrics-grid">
        <article class="metric-card accent">
          <span>Available balance</span>
          <strong>$48,620</strong>
          <small>Across 7 active campaigns</small>
        </article>
        <article class="metric-card">
          <span>Escrow held</span>
          <strong>$13,200</strong>
          <small>Pending approvals</small>
        </article>
        <article class="metric-card">
          <span>Next payout</span>
          <strong>June 28</strong>
          <small>Stripe Connect</small>
        </article>
      </div>

      <div class="toggle-row">
        @for (tab of tabOptions; track tab) {
          <button type="button" class="tab-button" [class.active]="selectedTab() === tab" (click)="setTab(tab)">
            {{ tab | titlecase }}
          </button>
        }
      </div>

      <div class="content-grid">
        <article class="panel-card">
          <h3>Payout schedule</h3>
          <div class="list">
            @for (item of payouts(); track item.label) {
              <div class="list-row">
                <div>
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.note }}</small>
                </div>
                <span>{{ item.amount }}</span>
              </div>
            }
          </div>
        </article>

        <article class="panel-card">
          <h3>{{ selectedTab() | titlecase }} overview</h3>
          <div class="list">
            @for (item of activePaymentView(); track item.label) {
              <div class="list-row">
                <div>
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.detail }}</small>
                </div>
                <span>{{ item.amount }}</span>
              </div>
            }
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .feature-panel {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .eyebrow {
        margin: 0 0 0.35rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.72rem;
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
        padding: 0.8rem 1.2rem;
        cursor: pointer;
      }
      .metrics-grid,
      .content-grid {
        display: grid;
        gap: 1rem;
      }
      .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .metric-card,
      .panel-card {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 20px;
        padding: 1rem 1.1rem;
      }
      .metric-card {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .metric-card.accent {
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(34, 211, 238, 0.18));
      }
      .metric-card span,
      .panel-card small,
      .checklist {
        color: #9fb0d4;
      }
      .metric-card strong {
        font-size: 2rem;
      }
      .content-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      }
      .panel-card {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
      }
      .toggle-row {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .tab-button {
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.5);
        color: #e2ecff;
        padding: 0.7rem 1rem;
        cursor: pointer;
      }
      .tab-button.active {
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.5), rgba(34, 211, 238, 0.28));
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .list-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 0.8rem 0.9rem;
        background: rgba(15, 23, 42, 0.45);
        border-radius: 14px;
      }
      .list-row div {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .list-row span {
        font-weight: 700;
      }
      .checklist {
        margin: 0;
        padding-left: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
    `
  ]
})
export class PaymentsComponent {
  readonly payouts = signal(payoutItems);
  readonly tabOptions = ['wallet', 'escrow', 'invoices'] as const;
  readonly selectedTab = signal<(typeof this.tabOptions)[number]>('wallet');

  readonly activePaymentView = computed(() => paymentViews[this.selectedTab()]);

  setTab(tab: (typeof this.tabOptions)[number]): void {
    this.selectedTab.set(tab);
  }
}
