import { Component, computed, inject, signal } from '@angular/core';
import { mockCompanyAccounts, mockCreatorAccounts, mockMarketplaceCampaigns } from '../../core/marketplace-mock-data';
import type { CompanyAccount, CreatorAccount, MarketplaceCampaign } from '../../core/marketplace-models';
import { DialogService } from '../../core/dialog.service';
import { SessionService } from '../../core/session.service';

@Component({
  selector: 'app-discovery',
  standalone: true,
  templateUrl: './discovery.html',
})
export class DiscoveryComponent {
  private readonly session = inject(SessionService);
  private readonly dialogs = inject(DialogService);
  readonly searchQuery = signal('');
  readonly creators = signal<CreatorAccount[]>(mockCreatorAccounts);
  readonly campaigns = signal<MarketplaceCampaign[]>(mockMarketplaceCampaigns);
  readonly companies = signal<CompanyAccount[]>(mockCompanyAccounts);

  readonly hotCreators = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.creators()
      .filter((creator) => !query || this.creatorSearchText(creator).includes(query))
      .slice()
      .sort((a, b) => b.trendingScore - a.trendingScore || a.name.localeCompare(b.name));
  });

  readonly hotCampaigns = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.campaigns()
      .filter((campaign) => !query || this.campaignSearchText(campaign).includes(query))
      .slice()
      .sort((a, b) => b.trendingScore - a.trendingScore || a.title.localeCompare(b.title));
  });

  readonly popularCompanies = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.companies()
      .filter((company) => !query || this.companySearchText(company).includes(query))
      .slice()
      .sort((a, b) => b.popularityScore - a.popularityScore || a.name.localeCompare(b.name));
  });

  readonly isCompany = computed(() => this.session.currentUser()?.type === 'company');

  readonly creatorsForYou = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.creators()
      .filter((creator) => !query || this.creatorSearchText(creator).includes(query))
      .slice()
      .sort((a, b) => b.engagementRate - a.engagementRate || b.trendingScore - a.trendingScore);
  });

  updateQuery(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.searchQuery.set(target.value);
    }
  }

  scrollCarousel(carousel: HTMLElement, direction: -1 | 1): void {
    carousel.scrollBy({ left: direction * carousel.clientWidth * 0.85, behavior: 'smooth' });
  }

  formatAudience(count: number): string {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(count);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('');
  }

  formatRate(rate: number): string {
    return new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(rate);
  }

  formatBudget(min: number, max: number): string {
    return `${this.formatRate(min)}–${this.formatRate(max)}`;
  }

  showCreator(creator: CreatorAccount): void {
    this.dialogs.openDetails(creator.name, creator.bio, [
      { label: 'Niche', value: creator.niche },
      { label: 'Audience', value: this.formatAudience(creator.audienceSize) },
      { label: 'Engagement', value: `${creator.engagementRate}%` },
      { label: 'Channels', value: creator.channels.join(', ') },
      { label: 'Typical rate', value: this.formatRate(creator.typicalRate) }
    ], 'CREATOR PROFILE');
  }

  showCampaign(campaign: MarketplaceCampaign): void {
    this.dialogs.openDetails(campaign.title, campaign.description, [
      { label: 'Brand', value: campaign.brandName },
      { label: 'Category', value: campaign.category },
      { label: 'Budget', value: this.formatBudget(campaign.budgetMin, campaign.budgetMax) },
      { label: 'Status', value: campaign.status }
    ], 'OPEN CAMPAIGN');
  }

  showCompany(company: CompanyAccount): void {
    this.dialogs.openDetails(company.name, company.description, [
      { label: 'Category', value: company.category },
      { label: 'Active campaigns', value: `${company.activeCampaigns}` },
      { label: 'Creator partners', value: `${company.creatorPartners}` },
      { label: 'Social profile', value: company.handle }
    ], 'BRAND PROFILE');
  }

  private creatorSearchText(creator: CreatorAccount): string {
    return `${creator.name} ${creator.handle} ${creator.niche} ${creator.bio} ${creator.channels.join(' ')}`.toLowerCase();
  }

  private campaignSearchText(campaign: MarketplaceCampaign): string {
    return `${campaign.title} ${campaign.brandName} ${campaign.category} ${campaign.description}`.toLowerCase();
  }

  private companySearchText(company: CompanyAccount): string {
    return `${company.name} ${company.handle} ${company.category} ${company.description}`.toLowerCase();
  }
}
