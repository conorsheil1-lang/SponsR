import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../core/dialog.service';
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
          <div class="panel-heading">
            <h3>Campaigns matching your profile</h3>
            <button type="button" class="show-more-button" (click)="viewCampaignMatches()">View all</button>
          </div>
          <ul>
            @for (match of matchingCampaigns().slice(0, 3); track match.name) {
              <li><strong>{{ match.name }}</strong><span>{{ match.meta }}</span></li>
            }
          </ul>
        </article>

        <article class="panel-card">
          <div class="panel-heading">
            <h3>Profile & social links</h3>
            <button type="button" class="show-more-button" (click)="viewSocialLinks()">View all</button>
          </div>
          <ul>
            @for (link of socialLinks().slice(0, 3); track link.platform) {
              <li><strong>{{ link.platform }}</strong><span>{{ link.handle }}</span></li>
            }
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
                @for (campaign of registeredCampaigns().slice(0, 3); track campaign.id) {
                  <li>
                    <div class="registered-item">
                      <strong>{{ campaign.title }}</strong>
                      <span>{{ campaign.companyName }} · {{ campaign.category }}</span>
                    </div>
                    <button type="button" class="withdraw-button" (click)="withdrawCampaignInterest(campaign.id)">Withdraw</button>
                  </li>
                }
              </ul>
              <button type="button" class="show-more-button" (click)="viewRegisteredCampaigns()">View all campaigns</button>
            } @else {
              <p class="interest-empty">No campaign registrations yet. Explore open campaigns to find a good fit.</p>
            }
          } @else {
            @if (registeredJobs().length) {
              <ul>
                @for (job of registeredJobs().slice(0, 3); track job.id) {
                  <li>
                    <div class="registered-item">
                      <strong>{{ job.title }}</strong>
                      <span>{{ job.companyName }} · {{ job.category }} · Due {{ job.interestDeadline }}</span>
                    </div>
                    <button type="button" class="withdraw-button" (click)="withdrawJobInterest(job.id)">Withdraw</button>
                  </li>
                }
              </ul>
              <button type="button" class="show-more-button" (click)="viewRegisteredJobs()">View all jobs</button>
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
              @for (brand of registeredBrands().slice(0, 3); track brand.id) {
                <li>
                  <div class="registered-item">
                    <strong>{{ brand.name }}</strong>
                    <span>{{ brand.category }} · {{ brand.activeCampaigns }} open campaigns</span>
                  </div>
                  <button type="button" class="withdraw-button" (click)="withdrawBrandInterest(brand.id)">Withdraw</button>
                </li>
              }
            </ul>
            <button type="button" class="show-more-button" (click)="viewRegisteredBrands()">View all brands</button>
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
        background: #e9eedf;
        border: 1px solid #e0e7d6;
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
        color: #748078;
        font-size: 0.8rem;
      }
      .interest-toggle {
        flex: 0 0 auto;
        gap: 0.25rem;
        padding: 0.25rem;
        border: 1px solid #e6e9e1;
        border-radius: 999px;
        background: #f8f9f6;
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
        background: #193b2a;
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
        background: #edf3e4;
        color: #486a36;
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
        color: #748078;
        font-size: 0.76rem;
      }
      .withdraw-button {
        flex: 0 0 auto;
        border: 1px solid #e6e9e1;
        color: #557842;
      }
      .withdraw-button:hover {
        border-color: #d7aaa3;
        color: #9c493c;
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
  private readonly dialogs = inject(DialogService);
  private readonly workspace = inject(MarketplaceWorkspaceService);
  readonly selectedInterestType = signal<'campaigns' | 'jobs'>('campaigns');
  readonly matchingCampaigns = signal([
    { name: 'Northstar Labs', meta: 'Beauty creator · $12.5K' },
    { name: 'Velora Health', meta: 'Wellness brand · $7.9K' },
    { name: 'SparkPilot', meta: 'UGC product launch · $9.2K' },
    { name: 'Morrow', meta: 'Wellness stories · $4.2K' },
    { name: 'Trailhead Supply', meta: 'Outdoor creator series · $6.8K' }
  ]);
  readonly socialLinks = signal([
    { platform: 'Instagram', handle: '@maria.content' },
    { platform: 'YouTube', handle: '220K subscribers' },
    { platform: 'TikTok', handle: '93K followers' },
    { platform: 'Pinterest', handle: '18K monthly viewers' },
    { platform: 'Newsletter', handle: '12K subscribers' }
  ]);
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

  viewCampaignMatches(): void {
    this.dialogs.openList(
      'Campaigns matching your profile',
      'Explore these partnership opportunities matched to your creator profile.',
      this.matchingCampaigns().map((match) => ({ title: match.name, subtitle: match.meta })),
      'RECOMMENDED CAMPAIGNS'
    );
  }

  viewSocialLinks(): void {
    this.dialogs.openList(
      'Profile & social links',
      'Your connected channels and audience reach.',
      this.socialLinks().map((link) => ({ title: link.platform, subtitle: link.handle })),
      'CREATOR PROFILE'
    );
  }

  viewRegisteredCampaigns(): void {
    this.dialogs.openList(
      'Registered campaign interest',
      'Campaigns you have registered interest in.',
      this.registeredCampaigns().map((campaign) => ({
        title: campaign.title,
        subtitle: `${campaign.companyName} · ${campaign.category}`
      })),
      'YOUR INTEREST'
    );
  }

  viewRegisteredJobs(): void {
    this.dialogs.openList(
      'Registered job interest',
      'Jobs you have registered interest in.',
      this.registeredJobs().map((job) => ({
        title: job.title,
        subtitle: `${job.companyName} · ${job.category}`,
        meta: `Interest deadline ${job.interestDeadline}`
      })),
      'YOUR INTEREST'
    );
  }

  viewRegisteredBrands(): void {
    this.dialogs.openList(
      'Brands you’re interested in',
      'Brands you would like to work with.',
      this.registeredBrands().map((brand) => ({
        title: brand.name,
        subtitle: brand.category,
        meta: `${brand.activeCampaigns} open campaigns`
      })),
      'YOUR INTEREST'
    );
  }
}
