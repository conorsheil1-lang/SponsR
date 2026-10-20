import { Component, signal } from '@angular/core';
import { channelProfiles, rateCards } from '../../core/mock-data';

@Component({
  selector: 'app-media-kit',
  standalone: true,
  template: `
    <section class="feature-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Media kit builder</p>
          <h2>Pitch your reach across every format</h2>
        </div>
        <button class="primary-button">Publish kit</button>
      </div>

      <div class="metrics-grid">
        <article class="metric-card accent">
          <span>Audience reach</span>
          <strong>1.2M</strong>
          <small>Combined monthly reach</small>
        </article>
        <article class="metric-card">
          <span>Average CTR</span>
          <strong>4.8%</strong>
          <small>Across channel mix</small>
        </article>
        <article class="metric-card">
          <span>Open rate</span>
          <strong>39%</strong>
          <small>Newsletter + email</small>
        </article>
      </div>

      <div class="content-grid">
        <article class="panel-card">
          <h3>Channel mix</h3>
          <ul class="channel-list">
            @for (channel of channels(); track channel.name) {
              <li>
                <div>
                  <strong>{{ channel.name }}</strong>
                  <span>{{ channel.followers }}</span>
                </div>
                <span class="status">{{ channel.status }}</span>
              </li>
            }
          </ul>
        </article>

        <article class="panel-card">
          <h3>Rate cards</h3>
          <div class="rate-list">
            @for (rate of pricing(); track rate.name) {
              <div class="rate-item">
                <div>
                  <p>{{ rate.name }}</p>
                  <span>{{ rate.detail }}</span>
                </div>
                <strong>{{ rate.price }}</strong>
              </div>
            }
          </div>
        </article>
      </div>

      <article class="panel-card tier-card">
        <div class="tier-header">
          <h3>Packaging options</h3>
          <span>{{ selectedTier() }} plan</span>
        </div>

        <div class="tier-list">
          @for (tier of tierOptions; track tier) {
            <button
              type="button"
              class="tier-button"
              [class.active]="selectedTier() === tier"
              (click)="setTier(tier)"
            >
              <strong>{{ tier }}</strong>
              <small>{{ tiers()[tier].rate }}</small>
            </button>
          }
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
      .panel-card p,
      .channel-list span {
        color: #9fb0d4;
      }
      .metric-card strong {
        font-size: 2rem;
      }
      .content-grid {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
      .panel-card {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .channel-list,
      .rate-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }
      .channel-list li,
      .rate-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.8rem 0.9rem;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.5);
      }
      .channel-list li div,
      .rate-item div {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .status {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
        padding: 0.3rem 0.5rem;
        border-radius: 999px;
        font-size: 0.75rem;
      }
      .rate-item p,
      .rate-item span {
        margin: 0;
      }
      .rate-item strong {
        font-size: 1.1rem;
      }
      .tier-card {
        gap: 1rem;
      }
      .tier-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }
      .tier-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.75rem;
      }
      .tier-button {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        align-items: flex-start;
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.55);
        color: #e2ecff;
        padding: 0.8rem;
        cursor: pointer;
      }
      .tier-button.active {
        border-color: rgba(34, 211, 238, 0.8);
        background: rgba(34, 211, 238, 0.12);
      }
    `
  ]
})
export class MediaKitComponent {
  readonly channels = signal(channelProfiles);
  readonly pricing = signal(rateCards);
  readonly tierOptions = ['Starter', 'Growth', 'Premium'] as const;
  readonly selectedTier = signal<(typeof this.tierOptions)[number]>('Growth');

  readonly tiers = signal({
    Starter: { rate: '$1.2K / launch', note: '1 campaign / month' },
    Growth: { rate: '$3.4K / launch', note: '3 campaigns / month' },
    Premium: { rate: '$7.8K / launch', note: 'Multi-channel partnership' }
  });

  setTier(tier: (typeof this.tierOptions)[number]): void {
    this.selectedTier.set(tier);
  }
}
