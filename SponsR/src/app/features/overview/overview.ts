import { Component, signal } from '@angular/core';
import { featuredCampaigns, featuredCompanies, featuredCreators, homepageMetrics, overviewFeatures } from '../../core/mock-data';

@Component({
  selector: 'app-overview',
  standalone: true,
  template: `
    <section class="feature-panel homepage">
      <div class="hero-card">
        <div class="hero-copy">
          <p class="eyebrow">Creator & sponsor marketplace</p>
          <h1>Match the right creators with the right brands.</h1>
          <p class="hero-text">
            Discover vetted talent, launch sponsor campaigns, and manage deliverables with escrow-backed payments from one unified platform.
          </p>
          <div class="cta-row">
            <button class="primary-button" type="button">Explore creators</button>
            <button class="secondary-button" type="button">Post a brief</button>
          </div>
          <div class="hero-metrics">
            @for (metric of homeMetrics(); track metric.label) {
              <div class="metric-pill">
                <strong>{{ metric.value }}</strong>
                <span>{{ metric.label }}</span>
              </div>
            }
          </div>
        </div>

        <div class="hero-panel">
          <div class="mini-card">
            <span>Featured creator</span>
            <h3>Nova Frame</h3>
            <p>Tech creator • 240K audience</p>
            <div class="mini-stats">
              <strong>7.2%</strong>
              <small>engagement</small>
            </div>
          </div>
          <div class="mini-card active">
            <span>New campaign</span>
            <h3>Northstar Labs</h3>
            <p>Summer creator launch</p>
            <div class="mini-stats">
              <strong>$12.5K</strong>
              <small>escrow-funded</small>
            </div>
          </div>
        </div>
      </div>

      <div class="section-head">
        <div>
          <p class="eyebrow">Featured creators</p>
          <h2>High-performing talent across channels</h2>
        </div>
        <button class="ghost-button" type="button">View all creators</button>
      </div>

      <div class="creator-grid">
        @for (creator of featuredCreatorsList(); track creator.name) {
          <article class="creator-card">
            <div class="creator-avatar">{{ creator.name.charAt(0) }}</div>
            <div class="creator-meta">
              <div class="creator-topline">
                <strong>{{ creator.name }}</strong>
                <span>{{ creator.niche }}</span>
              </div>
              <p>{{ creator.tag }}</p>
            </div>
            <div class="creator-row">
              <span>Reach</span>
              <strong>{{ creator.reach }}</strong>
            </div>
            <div class="creator-row">
              <span>Rate</span>
              <strong>{{ creator.rate }}</strong>
            </div>
          </article>
        }
      </div>

      <div class="section-head">
        <div>
          <p class="eyebrow">Featured campaigns</p>
          <h2>Brand briefs ready for creator proposals</h2>
        </div>
        <button class="ghost-button" type="button">Browse briefs</button>
      </div>

      <div class="campaign-grid">
        @for (campaign of featuredCampaignsList(); track campaign.title) {
          <article class="campaign-card">
            <div class="campaign-meta">
              <span class="campaign-tag">{{ campaign.status }}</span>
              <strong>{{ campaign.title }}</strong>
            </div>
            <p>{{ campaign.brand }}</p>
            <div class="campaign-row">
              <span>{{ campaign.type }}</span>
              <strong>{{ campaign.budget }}</strong>
            </div>
          </article>
        }
      </div>

      <div class="brands-wrap">
        <div class="section-head compact">
          <div>
            <p class="eyebrow">Featured companies</p>
            <h2>Brands already scaling with SponsR</h2>
          </div>
        </div>

        <div class="company-grid">
          @for (company of featuredCompaniesList(); track company) {
            <div class="company-chip">{{ company }}</div>
          }
        </div>
      </div>

      <div class="section-head">
        <div>
          <p class="eyebrow">Platform advantages</p>
          <h2>Everything sponsorship teams need in one flow</h2>
        </div>
      </div>

      <div class="feature-grid">
        @for (feature of platformFeatures(); track feature.title) {
          <article class="feature-card">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </article>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .homepage {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .hero-card {
        display: grid;
        grid-template-columns: 1.5fr 0.9fr;
        gap: 1rem;
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.28), rgba(15, 23, 42, 0.8));
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 28px;
        padding: 1.5rem;
      }
      .hero-copy {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .hero-copy h1 {
        margin: 0;
        font-size: clamp(2.5rem, 4vw, 4rem);
        line-height: 1.0;
        letter-spacing: -0.06em;
      }
      .hero-text {
        margin: 0;
        max-width: 680px;
        color: #cfe0ff;
        font-size: 1.05rem;
        line-height: 1.6;
      }
      .cta-row {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .primary-button,
      .secondary-button,
      .ghost-button {
        border-radius: 999px;
        padding: 0.85rem 1.15rem;
        cursor: pointer;
        border: none;
        font-weight: 600;
      }
      .primary-button {
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
        color: white;
      }
      .secondary-button {
        background: rgba(15, 23, 42, 0.7);
        color: #e2ecff;
        border: 1px solid rgba(148, 163, 184, 0.2);
      }
      .ghost-button {
        background: rgba(15, 23, 42, 0.6);
        color: #e2ecff;
        border: 1px solid rgba(148, 163, 184, 0.2);
      }
      .hero-metrics {
        display: grid;
        grid-template-columns: repeat(4, minmax(110px, 1fr));
        gap: 0.75rem;
      }
      .metric-pill {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 18px;
        padding: 0.7rem 0.8rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .metric-pill strong {
        font-size: 1.25rem;
      }
      .metric-pill span {
        color: #9fb0d4;
        font-size: 0.8rem;
      }
      .hero-panel {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .mini-card {
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 20px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .mini-card.active {
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(124, 58, 237, 0.2));
      }
      .mini-card span,
      .mini-card p,
      .campaign-row span,
      .creator-row span,
      .feature-card p,
      .creator-meta p,
      .campaign-card p,
      .section-head .eyebrow {
        color: #9fb0d4;
      }
      .mini-card h3,
      .campaign-card strong,
      .creator-topline strong,
      .section-head h2,
      .feature-card h3 {
        margin: 0;
      }
      .mini-stats {
        display: flex;
        justify-content: space-between;
        align-items: end;
        margin-top: 0.8rem;
      }
      .mini-stats strong {
        font-size: 1.9rem;
      }
      .section-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }
      .compact {
        margin-bottom: 0.25rem;
      }
      .eyebrow {
        margin: 0 0 0.35rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.72rem;
        color: #7cc9ff;
      }
      .section-head h2 {
        font-size: clamp(1.5rem, 2vw, 2.2rem);
      }
      .creator-grid,
      .campaign-grid,
      .feature-grid,
      .company-grid {
        display: grid;
        gap: 1rem;
      }
      .creator-grid {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      .campaign-grid {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }
      .feature-grid {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      .company-grid {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }
      .creator-card,
      .campaign-card,
      .feature-card {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 20px;
        padding: 1rem 1.1rem;
      }
      .creator-card {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
      }
      .creator-avatar {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
        font-weight: 700;
      }
      .creator-topline {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.6rem;
      }
      .creator-topline span,
      .campaign-tag {
        color: #7dd3fc;
        font-size: 0.75rem;
        border-radius: 999px;
        background: rgba(34, 211, 238, 0.12);
        padding: 0.3rem 0.6rem;
      }
      .creator-row,
      .campaign-row {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: center;
      }
      .campaign-card {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }
      .campaign-meta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .company-chip {
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 16px;
        padding: 0.9rem 1rem;
        text-align: center;
        font-weight: 600;
        color: #dfeaff;
      }
      .feature-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .feature-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
        font-size: 1.2rem;
      }
      .feature-card p {
        margin: 0;
        line-height: 1.5;
      }
      @media (max-width: 960px) {
        .hero-card {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class OverviewComponent {
  readonly platformFeatures = signal(overviewFeatures);
  readonly homeMetrics = signal(homepageMetrics);
  readonly featuredCreatorsList = signal(featuredCreators);
  readonly featuredCampaignsList = signal(featuredCampaigns);
  readonly featuredCompaniesList = signal(featuredCompanies);
}
