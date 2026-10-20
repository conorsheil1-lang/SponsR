import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-creator-portal',
  standalone: true,
  template: `
    <section class="portal-page">
      <div class="portal-banner">
        <div>
          <p class="eyebrow">Creator portal</p>
          <h2>Grow your creator brand and track campaign interest</h2>
        </div>
        <button class="primary-button" type="button">New proposal</button>
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
          <h3>Campaigns matching your profile</h3>
          <ul>
            <li><strong>Northstar Labs</strong><span>Beauty creator • $12.5K</span></li>
            <li><strong>Velora Health</strong><span>Wellness brand • $7.9K</span></li>
            <li><strong>SparkPilot</strong><span>UGC product launch • $9.2K</span></li>
          </ul>
        </article>

        <article class="panel-card">
          <h3>Profile & social links</h3>
          <ul>
            <li><strong>Instagram</strong><span>@maria.content</span></li>
            <li><strong>YouTube</strong><span>220K subscribers</span></li>
            <li><strong>TikTok</strong><span>93K followers</span></li>
          </ul>
        </article>

        <article class="panel-card wide">
          <h3>Brand interest</h3>
          <ul>
            <li><strong>Horizon Studio</strong><span>Interested in lifestyle collab</span></li>
            <li><strong>Velo Commerce</strong><span>Requested creator kit</span></li>
            <li><strong>Mint & Moss</strong><span>Invited to campaign shortlist</span></li>
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
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 22px;
        padding: 1.2rem 1.3rem;
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
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      }
      .stat-card,
      .panel-card {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 20px;
        padding: 1rem 1.1rem;
      }
      .stat-card {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .stat-card span,
      .panel-card li span,
      .panel-card li {
        color: #9fb0d4;
      }
      .stat-card strong {
        font-size: 2rem;
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
        background: rgba(15, 23, 42, 0.55);
        border-radius: 14px;
        padding: 0.8rem 0.9rem;
      }
      .panel-card li strong {
        color: #e2ecff;
      }
    `
  ]
})
export class CreatorPortalComponent {
  readonly stats = signal([
    { label: 'Interested brands', value: '18' },
    { label: 'Media kit views', value: '3.4K' },
    { label: 'Avg. response', value: '4.8%' },
    { label: 'Payout ready', value: '$8.4K' }
  ]);
}
