import { Component, computed, signal } from '@angular/core';
import { creatorProfiles, type CreatorProfile } from '../../core/mock-data';

@Component({
  selector: 'app-discovery',
  standalone: true,
  template: `
    <section class="feature-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Marketplace discovery</p>
          <h2>Find creators who match your campaign</h2>
        </div>
        <button class="ghost-button">Export leads</button>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <span>⌕</span>
          <input type="text" placeholder="Search by niche, channel, or keyword" [value]="searchQuery()" (input)="updateQuery($event)" />
        </div>
        <div class="filter-group">
          @for (filter of filters(); track filter) {
            <button
              class="chip"
              [class.active]="selectedFilter() === filter"
              type="button"
              (click)="setFilter(filter)"
            >
              {{ filter }}
            </button>
          }
        </div>
      </div>

      <div class="metrics-grid">
        <article class="metric-card accent">
          <span>Verified creators</span>
          <strong>4,280</strong>
          <small>+18% this month</small>
        </article>
        <article class="metric-card">
          <span>Avg. engagement</span>
          <strong>6.8%</strong>
          <small>Across 12 channels</small>
        </article>
        <article class="metric-card">
          <span>Pending offers</span>
          <strong>192</strong>
          <small>30 new this week</small>
        </article>
      </div>

      <div class="creator-grid">
        @for (creator of filteredCreators(); track creator.name) {
          <article class="creator-card">
            <div class="creator-head">
              <div class="avatar">{{ creator.name.charAt(0) }}</div>
              <div>
                <h3>{{ creator.name }}</h3>
                <p>{{ creator.niche }} • {{ creator.platform }}</p>
              </div>
            </div>

            <div class="stat-row">
              <span>Reach</span>
              <strong>{{ creator.reach }}</strong>
            </div>
            <div class="stat-row">
              <span>Engagement</span>
              <strong>{{ creator.engagement }}</strong>
            </div>
            <div class="stat-row">
              <span>Rate card</span>
              <strong>{{ creator.rate }}</strong>
            </div>

            <p class="highlight">{{ creator.highlight }}</p>

            <div class="card-actions">
              <button class="primary-button" type="button">Send offer</button>
              <button class="secondary-button" type="button">View kit</button>
            </div>
          </article>
        }
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
      .panel-header,
      .toolbar,
      .creator-head,
      .stat-row,
      .card-actions {
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
        font-size: clamp(1.7rem, 2vw, 2.5rem);
      }
      .ghost-button,
      .primary-button,
      .secondary-button,
      .chip {
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 999px;
        padding: 0.7rem 1rem;
        background: rgba(15, 23, 42, 0.6);
        color: #e2ecff;
        cursor: pointer;
      }
      .toolbar {
        flex-wrap: wrap;
        gap: 1rem;
      }
      .search-box {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1 1 280px;
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 16px;
        padding: 0.85rem 1rem;
      }
      .search-box input {
        background: transparent;
        border: none;
        color: #e2ecff;
        width: 100%;
        font-size: 1rem;
        outline: none;
      }
      .filter-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .chip.active {
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
        border-color: transparent;
        color: white;
      }
      .metrics-grid,
      .creator-grid {
        display: grid;
        gap: 1rem;
      }
      .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .metric-card,
      .creator-card {
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
      .creator-card p,
      .stat-row span {
        color: #9fb0d4;
      }
      .metric-card strong {
        font-size: 2rem;
      }
      .creator-grid {
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      }
      .creator-card {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
        font-weight: 700;
      }
      .creator-head {
        justify-content: flex-start;
        gap: 0.85rem;
      }
      .creator-head h3 {
        margin: 0 0 0.2rem;
      }
      .creator-head p {
        margin: 0;
      }
      .stat-row {
        border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        padding-bottom: 0.5rem;
      }
      .highlight {
        margin: 0;
        line-height: 1.5;
      }
      .card-actions {
        gap: 0.75rem;
      }
      .primary-button {
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
        border: none;
        color: white;
      }
      .secondary-button {
        background: rgba(15, 23, 42, 0.4);
      }
    `
  ]
})
export class DiscoveryComponent {
  readonly filters = signal(['All', 'Tech', 'Finance', 'Gaming', 'Lifestyle', 'Health']);
  readonly selectedFilter = signal('All');
  readonly searchQuery = signal('');

  readonly creators = signal<CreatorProfile[]>(creatorProfiles);

  readonly filteredCreators = computed(() => {
    const filter = this.selectedFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return this.creators().filter((creator) => {
      const matchesFilter = filter === 'All' || creator.niche === filter;
      const matchesQuery = !query || `${creator.name} ${creator.niche} ${creator.platform}`.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  });

  setFilter(filter: string): void {
    this.selectedFilter.set(filter);
  }

  updateQuery(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }
}
