import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CreatorProfileService } from '../../core/creator-profile.service';
import { DialogService } from '../../core/dialog.service';
import { MarketplaceWorkspaceService } from '../../core/marketplace-workspace.service';
import { SessionService } from '../../core/session.service';

@Component({
  selector: 'app-creator-portal',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="portal-page">
      @if (showBanner()) {
        <div class="portal-banner">
          <div>
            <p class="eyebrow">Creator portal</p>
            <h2>Grow your creator brand and track campaign interest</h2>
          </div>
          <div class="portal-banner-actions">
            <a class="primary-button" routerLink="/discovery">Find campaigns</a>
            <button type="button" class="dismiss-banner-button" aria-label="Hide creator portal introduction"
              (click)="dismissBanner()">×</button>
          </div>
        </div>
      }

      <section class="metrics-area" aria-labelledby="creator-metrics-heading">
        <h3 id="creator-metrics-heading">Metrics</h3>
        <div class="stats-grid">
          @for (stat of stats(); track stat.label) {
            <article class="stat-card">
              <span>{{ stat.label }}</span>
              <strong>{{ stat.value }}</strong>
            </article>
          }
        </div>
      </section>

      <div class="content-grid">
        <h3 class="section-heading">My Content</h3>
        <button type="button" class="content-launch-card" (click)="openContentDialog('me')" aria-haspopup="dialog">
          <span class="content-launch-heading">My Profile <span aria-hidden="true">↗</span></span>
          <span class="content-launch-summary">{{ profile().name }} · {{ profile().handle }}</span>
        </button>
        <button type="button" class="content-launch-card" (click)="openContentDialog('social')" aria-haspopup="dialog">
          <span class="content-launch-heading">Profile & social links <span aria-hidden="true">↗</span></span>
          <span class="content-launch-summary">{{ profile().socialLinks.length }} platforms linked</span>
        </button>
        <button type="button" class="content-launch-card" (click)="openContentDialog('tags')" aria-haspopup="dialog">
          <span class="content-launch-heading">Content tags <span aria-hidden="true">↗</span></span>
          <span class="content-launch-summary">{{ profile().contentTags.length }} tags · Help brands find your content</span>
        </button>
        <button type="button" class="content-launch-card" (click)="openContentDialog('rates')" aria-haspopup="dialog">
          <span class="content-launch-heading">Rates <span aria-hidden="true">↗</span></span>
          <span class="content-launch-summary">{{ profile().rateCard.length }} content types priced</span>
        </button>

        <h3 class="section-heading interests-section-heading">My Interests</h3>
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

      @if (activeContentDialog(); as dialog) {
        <div class="content-dialog-backdrop" (click)="closeContentDialog()">
          <section class="content-dialog" role="dialog" aria-modal="true" [attr.aria-label]="contentDialogTitle()"
            (click)="$event.stopPropagation()">
            <button type="button" class="dialog-close-button" aria-label="Close dialog" (click)="closeContentDialog()">×</button>
            @if (dialog === 'me') {
              <p class="eyebrow">MY CONTENT</p>
              <h2>My Profile</h2>
              <div class="me-card-layout">
                <label class="creator-avatar-picker" for="creator-avatar-upload">
                  <span class="creator-avatar-image">
                    @if (profile().avatarUrl) { <img [src]="profile().avatarUrl" alt="" /> }
                    @else { <span aria-hidden="true">{{ getInitials(profile().name) }}</span> }
                  </span>
                  <span class="creator-avatar-overlay">Change photo</span>
                  <input id="creator-avatar-upload" type="file" accept="image/*" (change)="selectAvatar($event)" aria-label="Change profile photo" />
                </label>
                <form class="me-profile-form" (ngSubmit)="saveCreatorDetails()">
                  <label>Name<input name="creatorName" [value]="nameDraft" (input)="updateNameDraft($event)" required /></label>
                  <label>Handle<input name="creatorHandle" [value]="handleDraft" (input)="updateHandleDraft($event)" required /></label>
                  <label>Bio<textarea name="creatorBio" [value]="bioDraft" (input)="updateBioDraft($event)" rows="3"></textarea></label>
                  <button type="submit" class="show-more-button">Save profile</button>
                  @if (profileSaveMessage()) { <span class="profile-save-message" role="status">{{ profileSaveMessage() }}</span> }
                </form>
              </div>
              @if (profileSaveError()) { <p class="profile-error" role="alert">{{ profileSaveError() }}</p> }
              @if (avatarError()) { <p class="profile-error" role="alert">{{ avatarError() }}</p> }
            } @else if (dialog === 'social') {
              <p class="eyebrow">MY CONTENT</p>
              <h2>Profile & social links</h2>
              <ul>
                @for (link of profile().socialLinks; track link.platform) {
                  <li class="social-profile-row">
                    <a [href]="link.url" target="_blank" rel="noopener noreferrer"><strong>{{ link.platform }}</strong><span>{{ link.handle }}</span></a>
                    <button type="button" class="remove-profile-item" [attr.aria-label]="'Remove ' + link.platform + ' link'" (click)="removeSocialLink(link.platform)">Remove</button>
                  </li>
                }
              </ul>
              <form class="profile-editor-form" (ngSubmit)="addSocialLink()">
                <label>Platform
                  <select name="socialPlatform" [value]="socialPlatform" (change)="updateSocialPlatform($event)">
                    @for (platform of availablePlatforms(); track platform) { <option [value]="platform">{{ platform }}</option> }
                  </select>
                </label>
                <label>Handle<input name="socialHandle" [value]="socialHandle" (input)="updateSocialHandle($event)" placeholder="@yourhandle" required /></label>
                <label>Profile URL<input name="socialUrl" type="url" [value]="socialUrl" (input)="updateSocialUrl($event)" placeholder="https://…" required /></label>
                @if (socialPlatform === 'Other') {
                  <label>Platform name<input name="customSocialPlatform" [value]="customSocialPlatform" (input)="updateCustomSocialPlatform($event)" placeholder="e.g. Substack" required /></label>
                }
                <button type="submit" class="show-more-button">Link platform <span aria-hidden="true">＋</span></button>
              </form>
              @if (profileError()) { <p class="profile-error" role="alert">{{ profileError() }}</p> }
            } @else if (dialog === 'tags') {
              <p class="eyebrow">MY CONTENT</p>
              <h2>Content tags</h2>
              <p class="dialog-description">Help brands find you by the topics and styles you create.</p>
              <div class="creator-content-tags">
                @for (tag of profile().contentTags; track tag) {
                  <span class="creator-content-tag">{{ tag }}<button type="button" [attr.aria-label]="'Remove ' + tag + ' tag'" (click)="removeContentTag(tag)">×</button></span>
                } @empty {
                  <p class="empty-profile-copy">Add a few tags so companies can discover your content.</p>
                }
              </div>
              <div class="tag-suggestions" aria-label="Suggested content tags">
                <span>Suggested</span>
                @for (tag of suggestedTags; track tag) {
                  <button type="button" [disabled]="profile().contentTags.includes(tag)" (click)="addTag(tag)">{{ tag }} <span aria-hidden="true">＋</span></button>
                }
              </div>
              <form class="add-tag-form" (ngSubmit)="addTag(tagInput)">
                <label for="custom-content-tag">Create a tag</label>
                <div><input id="custom-content-tag" name="customContentTag" [value]="tagInput" (input)="updateTagInput($event)" placeholder="e.g. slow living" /><button type="submit">Add tag</button></div>
              </form>
            } @else {
              <p class="eyebrow">MY CONTENT</p>
              <h2>Rates</h2>
              <p class="dialog-description">Set a starting price for your content and platforms.</p>
              <ul class="rate-card-list">
                @for (item of profile().rateCard; track $index) {
                  <li class="rate-card-item">
                    <div class="registered-item">
                      <strong>{{ item.deliverable }}@if (item.durationMinutes) { · {{ item.durationMinutes }} min }</strong>
                      <span>{{ item.platform }}</span>
                    </div>
                    <strong class="rate-price">{{ formatRate(item.rate) }}</strong>
                    <button type="button" class="remove-profile-item" [attr.aria-label]="'Remove ' + item.deliverable + ' rate'" (click)="removeRateCardItem($index)">Remove</button>
                  </li>
                }
              </ul>
              <form class="rate-editor-form" (ngSubmit)="addRateCardItem()">
                <label>Content type
                  <select name="rateType" [value]="rateType" (change)="updateRateType($event)">
                    @for (type of rateTypes; track type) { <option [value]="type">{{ type }}</option> }
                  </select>
                </label>
                @if (rateType === 'Video' || rateType === 'Live stream') {
                  <label>Duration (minutes)
                    <input name="rateDuration" type="number" min="1" step="1" [value]="rateDuration" (input)="updateRateDuration($event)" required />
                  </label>
                }
                @if (rateType === 'Other') {
                  <label>Content type
                    <input name="customRateType" [value]="customRateType" (input)="updateCustomRateType($event)" placeholder="e.g. Newsletter feature" required />
                  </label>
                }
                <label>Platform
                  <select name="ratePlatform" [value]="ratePlatform" (change)="updateRatePlatform($event)">
                    @for (platform of ratePlatforms(); track platform) { <option [value]="platform">{{ platform }}</option> }
                  </select>
                </label>
                <label>Price (USD)
                  <input name="ratePrice" type="number" min="0.01" step="0.01" [value]="ratePrice" (input)="updateRatePrice($event)" required />
                </label>
                <button type="submit" class="show-more-button">Add rate</button>
              </form>
              @if (rateError()) { <p class="profile-error" role="alert">{{ rateError() }}</p> }
            }
          </section>
        </div>
      }
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
      .metrics-area {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .portal-banner {
        grid-template-columns: 1fr auto;
        align-items: center;
        background: #e9eedf;
        border: 1px solid #e0e7d6;
        border-radius: 22px;
        padding: 1.2rem 1.3rem;
      }
      .portal-banner-actions {
        display: flex;
        align-items: center;
        gap: 0.7rem;
      }
      .dismiss-banner-button {
        display: grid;
        place-items: center;
        width: 2rem;
        height: 2rem;
        border: 1px solid #d0d9c6;
        border-radius: 50%;
        background: transparent;
        color: #486a36;
        cursor: pointer;
        font: inherit;
        font-size: 1.25rem;
        line-height: 1;
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
      .section-heading {
        grid-column: 1 / -1;
        margin: 0;
        color: #26382b;
        font-size: 1.1rem;
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
  private static readonly maxAvatarSize = 5 * 1024 * 1024;
  private readonly dialogs = inject(DialogService);
  private readonly workspace = inject(MarketplaceWorkspaceService);
  private readonly creatorProfile = inject(CreatorProfileService);
  private readonly session = inject(SessionService);
  protected readonly showBanner = signal(!this.isBannerDismissed());
  protected readonly activeContentDialog = signal<'me' | 'social' | 'tags' | 'rates' | null>(null);
  protected readonly profile = this.creatorProfile.profile;
  protected nameDraft = this.profile().name;
  protected handleDraft = this.profile().handle;
  protected bioDraft = this.profile().bio;
  protected readonly profileSaveMessage = signal('');
  protected readonly profileSaveError = signal('');
  protected readonly avatarError = signal('');
  protected readonly suggestedTags = ['lifestyle', 'living', 'tech', 'wellness', 'food', 'travel', 'fashion', 'gaming', 'beauty', 'fitness'];
  protected readonly platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitch', 'Pinterest', 'Podcast', 'Newsletter', 'Other'];
  protected readonly rateTypes = ['Video', 'Live stream', 'Story frames', 'Photo', 'Product review', 'Blog post', 'Other'];
  protected readonly availablePlatforms = computed(() =>
    this.platforms.filter((platform) => !this.profile().socialLinks.some((link) => link.platform === platform))
  );
  protected readonly ratePlatforms = computed(() => [...new Set([
    ...this.profile().channels,
    ...this.profile().rateCard.map((item) => item.platform)
  ])]);
  protected tagInput = '';
  protected socialPlatform = this.platforms.find((platform) =>
    !this.profile().socialLinks.some((link) => link.platform === platform)
  ) ?? 'Other';
  protected customSocialPlatform = '';
  protected socialHandle = '';
  protected socialUrl = '';
  protected rateType = 'Video';
  protected customRateType = '';
  protected rateDuration = '';
  protected ratePlatform = this.profile().channels[0] ?? 'Instagram';
  protected ratePrice = '';
  protected readonly profileError = signal('');
  protected readonly rateError = signal('');
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

  openContentDialog(dialog: 'me' | 'social' | 'tags' | 'rates'): void {
    this.profileError.set('');
    this.profileSaveError.set('');
    this.profileSaveMessage.set('');
    this.avatarError.set('');
    this.rateError.set('');
    this.nameDraft = this.profile().name;
    this.handleDraft = this.profile().handle;
    this.bioDraft = this.profile().bio;
    this.activeContentDialog.set(dialog);
  }

  closeContentDialog(): void {
    this.activeContentDialog.set(null);
  }

  contentDialogTitle(): string {
    const dialog = this.activeContentDialog();
    return dialog === 'me' ? 'Edit creator profile'
      : dialog === 'social' ? 'Edit social links'
        : dialog === 'tags' ? 'Edit content tags'
          : 'Edit rates';
  }

  @HostListener('document:keydown.escape')
  closeContentDialogOnEscape(): void {
    if (this.activeContentDialog()) {
      this.closeContentDialog();
    }
  }

  withdrawCampaignInterest(campaignId: string): void {
    this.workspace.toggleCampaignInterest(campaignId);
  }

  withdrawJobInterest(jobId: string): void {
    this.workspace.toggleJobInterest(jobId);
  }

  withdrawBrandInterest(brandId: string): void {
    this.workspace.toggleBrandInterest(brandId);
  }

  addTag(value: string): void {
    this.creatorProfile.addContentTag(value);
    this.tagInput = '';
  }

  updateTagInput(event: Event): void {
    this.tagInput = (event.target as HTMLInputElement).value;
  }

  updateSocialPlatform(event: Event): void {
    this.socialPlatform = (event.target as HTMLSelectElement).value;
  }

  updateSocialHandle(event: Event): void {
    this.socialHandle = (event.target as HTMLInputElement).value;
  }

  updateSocialUrl(event: Event): void {
    this.socialUrl = (event.target as HTMLInputElement).value;
  }

  updateCustomSocialPlatform(event: Event): void {
    this.customSocialPlatform = (event.target as HTMLInputElement).value;
  }

  updateRateType(event: Event): void {
    this.rateType = (event.target as HTMLSelectElement).value;
    this.rateError.set('');
  }

  updateRateDuration(event: Event): void {
    this.rateDuration = (event.target as HTMLInputElement).value;
  }

  updateRatePlatform(event: Event): void {
    this.ratePlatform = (event.target as HTMLSelectElement).value;
  }

  updateRatePrice(event: Event): void {
    this.ratePrice = (event.target as HTMLInputElement).value;
  }

  updateCustomRateType(event: Event): void {
    this.customRateType = (event.target as HTMLInputElement).value;
  }

  addRateCardItem(): void {
    this.rateError.set('');
    const rate = Number(this.ratePrice);
    const durationMinutes = this.rateDuration ? Number(this.rateDuration) : undefined;
    try {
      this.creatorProfile.addRateCardItem({
        deliverable: this.rateType === 'Other' ? this.customRateType : this.rateType,
        platform: this.ratePlatform,
        rate,
        currency: 'USD',
        ...(durationMinutes !== undefined ? { durationMinutes } : {})
      });
      this.rateDuration = '';
      this.ratePrice = '';
      this.customRateType = '';
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      this.rateError.set(error.message);
    }
  }

  removeRateCardItem(index: number): void {
    this.creatorProfile.removeRateCardItem(index);
  }

  formatRate(rate: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(rate);
  }

  removeContentTag(tag: string): void {
    this.creatorProfile.removeContentTag(tag);
  }

  getInitials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase();
  }

  updateNameDraft(event: Event): void {
    this.nameDraft = (event.target as HTMLInputElement).value;
    this.profileSaveMessage.set('');
  }

  updateHandleDraft(event: Event): void {
    this.handleDraft = (event.target as HTMLInputElement).value;
    this.profileSaveMessage.set('');
  }

  updateBioDraft(event: Event): void {
    this.bioDraft = (event.target as HTMLTextAreaElement).value;
    this.profileSaveMessage.set('');
  }

  saveCreatorDetails(): void {
    this.profileSaveMessage.set('');
    this.profileSaveError.set('');
    try {
      this.creatorProfile.updatePublicProfile({
        name: this.nameDraft,
        handle: this.handleDraft,
        bio: this.bioDraft
      });
      this.profileSaveMessage.set('Profile saved.');
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      this.profileSaveError.set(error.message);
    }
  }

  selectAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.avatarError.set('');
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.avatarError.set('Choose an image file for your profile photo.');
      input.value = '';
      return;
    }
    if (file.size > CreatorPortalComponent.maxAvatarSize) {
      this.avatarError.set('Choose an image smaller than 5 MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        this.avatarError.set('The selected image could not be loaded.');
        return;
      }
      this.creatorProfile.updateAvatar(reader.result);
    };
    reader.onerror = () => this.avatarError.set('The selected image could not be read. Please try another image.');
    reader.readAsDataURL(file);
  }

  addSocialLink(): void {
    this.profileError.set('');
    try {
      this.creatorProfile.addSocialLink({
        platform: this.socialPlatform === 'Other' ? this.customSocialPlatform : this.socialPlatform,
        handle: this.socialHandle,
        url: this.socialUrl
      });
      this.socialHandle = '';
      this.socialUrl = '';
      this.customSocialPlatform = '';
      this.socialPlatform = this.availablePlatforms()[0] ?? 'Other';
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      this.profileError.set(error.message);
    }
  }

  removeSocialLink(platform: string): void {
    this.creatorProfile.removeSocialLink(platform);
  }

  dismissBanner(): void {
    localStorage.setItem(this.bannerStorageKey(), 'dismissed');
    this.showBanner.set(false);
  }

  private isBannerDismissed(): boolean {
    return localStorage.getItem(this.bannerStorageKey()) === 'dismissed';
  }

  private bannerStorageKey(): string {
    const user = this.session.currentUser();
    const userKey = user?.accountId ?? user?.email.toLocaleLowerCase() ?? 'guest';
    return `sponsr-creator-portal-banner:${encodeURIComponent(userKey)}`;
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
