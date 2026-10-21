import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarketplaceWorkspaceService } from '../../core/marketplace-workspace.service';

@Component({
  selector: 'app-creator-portal',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="portal-page">
      <div class="portal-banner">
        <div>
          <p class="eyebrow">Creator portal</p>
          <h2>Grow your creator brand and track campaign interest</h2>
        </div>
        <a class="primary-button" routerLink="/discovery">Find campaigns</a>
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

        <article class="panel-card wide registered-opportunities">
          <div class="registered-heading">
            <div>
              <h3>Registered interest</h3>
              <p>Keep track of the campaigns and jobs you’ve raised your hand for.</p>
            </div>
            <div class="interest-toggle" role="group" aria-label="Registered opportunity type">
              <button type="button" [class.active]="selectedInterestType() === 'campaigns'"
                [attr.aria-pressed]="selectedInterestType() === 'campaigns'" (click)="selectedInterestType.set('campaigns')">
                Campaigns <span>{{ registeredCampaigns().length }}</span>
              </button>
              <button type="button" [class.active]="selectedInterestType() === 'jobs'"
                [attr.aria-pressed]="selectedInterestType() === 'jobs'" (click)="selectedInterestType.set('jobs')">
                Jobs <span>{{ registeredJobs().length }}</span>
              </button>
            </div>
          </div>
          @if (selectedInterestType() === 'campaigns') {
            @if (registeredCampaigns().length) {
              <ul>
                @for (campaign of registeredCampaigns(); track campaign.id) {
                  <li>
                    <div class="registered-item">
                      <strong>{{ campaign.title }}</strong>
                      <span>{{ campaign.companyName }} · {{ campaign.category }}</span>
                    </div>
                    <button type="button" class="withdraw-button" (click)="withdrawCampaignInterest(campaign.id)">Withdraw</button>
                  </li>
                }
              </ul>
            } @else {
              <p class="interest-empty">No campaign registrations yet. Explore open campaigns to find a good fit.</p>
            }
          } @else {
            @if (registeredJobs().length) {
              <ul>
                @for (job of registeredJobs(); track job.id) {
                  <li>
                    <div class="registered-item">
                      <strong>{{ job.title }}</strong>
                      <span>{{ job.companyName }} · {{ job.category }} · Due {{ job.interestDeadline }}</span>
                    </div>
                    <button type="button" class="withdraw-button" (click)="withdrawJobInterest(job.id)">Withdraw</button>
                  </li>
                }
              </ul>
            } @else {
              <p class="interest-empty">No job registrations yet. Explore open jobs to find your next opportunity.</p>
            }
          }
        </article>

        <article class="panel-card wide registered-opportunities">
          <div class="registered-heading">
            <div>
              <h3>Brands you’re interested in</h3>
              <p>Keep track of brands you’d like to work with.</p>
            </div>
            <span class="brand-interest-count">{{ registeredBrands().length }} saved</span>
          </div>
          @if (registeredBrands().length) {
            <ul>
              @for (brand of registeredBrands(); track brand.id) {
                <li>
                  <div class="registered-item">
                    <strong>{{ brand.name }}</strong>
                    <span>{{ brand.category }} · {{ brand.activeCampaigns }} open campaigns</span>
                  </div>
                  <button type="button" class="withdraw-button" (click)="withdrawBrandInterest(brand.id)">Withdraw</button>
                </li>
              }
            </ul>
          } @else {
            <p class="interest-empty">No brands saved yet. Explore popular brands to let them know you’re interested.</p>
          }
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
      .registered-heading,
      .interest-toggle,
      .registered-opportunities li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .registered-heading {
        margin-bottom: 1rem;
      }
      .registered-heading p,
      .interest-empty {
        margin: 0.4rem 0 0;
        color: #9fb0d4;
        font-size: 0.8rem;
      }
      .interest-toggle {
        flex: 0 0 auto;
        gap: 0.25rem;
        padding: 0.25rem;
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 999px;
      }
      .interest-toggle button,
      .withdraw-button {
        border: 0;
        border-radius: 999px;
        padding: 0.55rem 0.8rem;
        background: transparent;
        color: #9fb0d4;
        cursor: pointer;
        font: inherit;
        font-size: 0.72rem;
      }
      .interest-toggle button.active {
        background: rgba(124, 58, 237, 0.24);
        color: #fff;
      }
      .interest-toggle button span {
        margin-left: 0.25rem;
        opacity: 0.75;
      }
      .brand-interest-count {
        flex: 0 0 auto;
        padding: 0.45rem 0.7rem;
        border-radius: 999px;
        background: rgba(124, 58, 237, 0.16);
        color: #c4b5fd;
        font-size: 0.72rem;
        font-weight: 650;
      }
      .registered-opportunities ul {
        gap: 0.55rem;
      }
      .registered-opportunities li {
        align-items: center;
      }
      .registered-item {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .registered-item span {
        color: #9fb0d4;
        font-size: 0.76rem;
      }
      .withdraw-button {
        flex: 0 0 auto;
        border: 1px solid rgba(148, 163, 184, 0.2);
      }
      .withdraw-button:hover {
        border-color: rgba(248, 113, 113, 0.6);
        color: #fecaca;
      }
      @media (max-width: 620px) {
        .registered-heading {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `
  ]
})
export class CreatorPortalComponent {
  private readonly workspace = inject(MarketplaceWorkspaceService);
  readonly selectedInterestType = signal<'campaigns' | 'jobs'>('campaigns');
  readonly registeredCampaigns = computed(() => this.workspace.getRegisteredCampaigns());
  readonly registeredJobs = computed(() => this.workspace.getRegisteredJobs());
  readonly registeredBrands = computed(() => this.workspace.getRegisteredBrands());

  readonly stats = signal([
    { label: 'Interested brands', value: '18' },
    { label: 'Media kit views', value: '3.4K' },
    { label: 'Avg. response', value: '4.8%' },
    { label: 'Payout ready', value: '$8.4K' }
  ]);

  withdrawCampaignInterest(campaignId: string): void {
    this.workspace.toggleCampaignInterest(campaignId);
  }

  withdrawJobInterest(jobId: string): void {
    this.workspace.toggleJobInterest(jobId);
  }

  withdrawBrandInterest(brandId: string): void {
    this.workspace.toggleBrandInterest(brandId);
  }
}
