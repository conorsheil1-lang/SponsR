import { Component, signal } from '@angular/core';

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
        <button class="primary-button" type="button">Create brief</button>
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
          <h3>Potential sponsorship matches</h3>
          <ul>
            <li><strong>Nova Frame</strong><span>Tech creator • 240K reach</span></li>
            <li><strong>Rift Rush</strong><span>Gaming creator • 420K reach</span></li>
            <li><strong>Cora Content</strong><span>Finance creator • 180K reach</span></li>
          </ul>
        </article>

        <article class="panel-card">
          <h3>Active campaigns</h3>
          <ul>
            <li><strong>Northstar Labs</strong><span>Escrow funded</span></li>
            <li><strong>Velora Health</strong><span>Draft in review</span></li>
            <li><strong>SparkPilot</strong><span>Waiting for brief approval</span></li>
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
export class CompanyPortalComponent {
  readonly stats = signal([
    { label: 'Campaigns', value: '14' },
    { label: 'Creators shortlisted', value: '27' },
    { label: 'Escrow funded', value: '$84K' },
    { label: 'Approval rate', value: '92%' }
  ]);
}
