import { Component, computed, inject, signal } from '@angular/core';
import { mockCompanyAccounts, mockCreatorAccounts, mockMarketplaceCampaigns } from '../../core/marketplace-mock-data';
import type { CompanyAccount, CreatorAccount, MarketplaceCampaign } from '../../core/marketplace-models';
import { DialogService } from '../../core/dialog.service';
import { CreatorProfileService } from '../../core/creator-profile.service';
import { MarketplaceWorkspaceService } from '../../core/marketplace-workspace.service';
import type { JobOpportunity } from '../../core/job-marketplace-data';
import { SessionService } from '../../core/session.service';

interface DiscoveryCampaign {
  id: string;
  brandName: string;
  title: string;
  category: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  applicants: number;
  status: string;
  trendingScore: number;
  avatarTone: string;
}

@Component({
  selector: 'app-discovery',
  standalone: true,
  templateUrl: './discovery.html',
})
export class DiscoveryComponent {
  private readonly session = inject(SessionService);
  private readonly dialogs = inject(DialogService);
  private readonly workspace = inject(MarketplaceWorkspaceService);
  private readonly creatorProfile = inject(CreatorProfileService);
  readonly searchQuery = signal('');
  readonly creators = signal<CreatorAccount[]>(mockCreatorAccounts);
  private readonly creatorDirectory = computed(() => this.creators().map((creator) =>
    creator.id === this.creatorProfile.profile().id
      ? {
          ...creator,
          name: this.creatorProfile.profile().name,
          handle: this.creatorProfile.profile().handle,
          bio: this.creatorProfile.profile().bio,
          avatarUrl: this.creatorProfile.profile().avatarUrl,
          channels: this.creatorProfile.profile().channels,
          contentTags: this.creatorProfile.profile().contentTags
        }
      : creator
  ));
  readonly campaigns = signal<MarketplaceCampaign[]>(mockMarketplaceCampaigns);
  readonly companies = signal<CompanyAccount[]>(mockCompanyAccounts);
  readonly creatorNicheFilter = signal('');
  readonly creatorTagFilter = signal('');
  readonly creatorPlatformFilter = signal('');
  readonly creatorAudienceFilter = signal('');
  readonly creatorEngagementFilter = signal('');
  readonly creatorRateFilter = signal('');
  readonly campaignCategoryFilter = signal('');
  readonly campaignBrandFilter = signal('');
  readonly campaignStatusFilter = signal('');
  readonly jobCategoryFilter = signal('');
  readonly jobBrandFilter = signal('');
  readonly jobBudgetFilter = signal('');
  readonly jobDeadlineFilter = signal('');
  readonly selectedOpportunityType = signal<'campaigns' | 'jobs'>('campaigns');

  readonly hotCreators = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.creatorDirectory()
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

  readonly creatorNiches = computed(() => this.unique(this.creatorDirectory().map((creator) => creator.niche)));
  readonly creatorContentTags = computed(() => this.unique(this.creatorDirectory().flatMap((creator) => creator.contentTags)));
  readonly creatorPlatforms = computed(() => this.unique(this.creatorDirectory().flatMap((creator) => creator.channels)));
  readonly campaignBrands = computed(() => this.unique(this.campaignListings().map((campaign) => campaign.brandName)));
  readonly jobBrands = computed(() => this.unique(this.availableJobs().map((job) => job.companyName)));
  readonly campaignCategories = computed(() => this.unique(this.campaignListings().map((campaign) => campaign.category)));
  readonly jobCategories = computed(() => this.unique(this.availableJobs().map((job) => job.category)));

  readonly allCreators = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.creatorDirectory()
      .filter((creator) => {
        const audience = this.creatorAudienceFilter();
        const engagement = Number(this.creatorEngagementFilter());
        const maxRate = Number(this.creatorRateFilter());
        return (!query || this.creatorSearchText(creator).includes(query))
          && (!this.creatorNicheFilter() || creator.niche === this.creatorNicheFilter())
          && (!this.creatorTagFilter() || creator.contentTags.includes(this.creatorTagFilter()))
          && (!this.creatorPlatformFilter() || creator.channels.includes(this.creatorPlatformFilter()))
          && (!audience || (audience === 'under-100k' ? creator.audienceSize < 100_000
            : audience === '100k-500k' ? creator.audienceSize >= 100_000 && creator.audienceSize < 500_000
              : creator.audienceSize >= 500_000))
          && (!engagement || creator.engagementRate >= engagement)
          && (!maxRate || creator.typicalRate <= maxRate);
      })
      .slice()
      .sort((a, b) => b.trendingScore - a.trendingScore || a.name.localeCompare(b.name));
  });

  readonly campaignListings = computed<DiscoveryCampaign[]>(() => {
    const currentUserCampaigns: DiscoveryCampaign[] = this.workspace.campaigns()
      .filter((campaign) => !mockMarketplaceCampaigns.some(
        (existing) => existing.title === campaign.title && existing.brandName === campaign.companyName
      ))
      .map((campaign) => ({
        id: campaign.id,
        brandName: campaign.companyName,
        title: campaign.title,
        category: campaign.category,
        description: campaign.description,
        budgetMin: 0,
        budgetMax: 0,
        applicants: campaign.interestedCreatorIds.length,
        status: 'Open',
        trendingScore: 0,
        avatarTone: 'sage'
      }));
    return [...mockMarketplaceCampaigns, ...currentUserCampaigns];
  });

  readonly allCampaigns = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.campaignListings()
      .filter((campaign) =>
        (!query || this.campaignSearchText(campaign).includes(query))
        && (!this.campaignCategoryFilter() || campaign.category === this.campaignCategoryFilter())
        && (!this.campaignBrandFilter() || campaign.brandName === this.campaignBrandFilter())
        && (!this.campaignStatusFilter() || campaign.status === this.campaignStatusFilter())
      )
      .slice()
      .sort((a, b) => b.trendingScore - a.trendingScore || a.title.localeCompare(b.title));
  });

  readonly availableJobs = computed(() => this.workspace.jobs().filter((job) =>
    new Date(`${job.interestDeadline}T23:59:59`).getTime() >= Date.now()
  ));

  readonly allJobs = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.availableJobs()
      .filter((job) => {
        const budgetFilter = this.jobBudgetFilter();
        const deadlineDays = Number(this.jobDeadlineFilter());
        const daysRemaining = Math.ceil(
          (new Date(`${job.interestDeadline}T23:59:59`).getTime() - Date.now()) / 86_400_000
        );
        const searchText = `${job.title} ${job.companyName} ${job.category} ${job.description} ${job.campaignTitle ?? ''}`.toLowerCase();
        return (!query || searchText.includes(query))
          && (!this.jobCategoryFilter() || job.category === this.jobCategoryFilter())
          && (!this.jobBrandFilter() || job.companyName === this.jobBrandFilter())
          && (!budgetFilter || (budgetFilter === 'under-2k' ? job.budgetMin < 2_000
            : budgetFilter === '2k-5k' ? job.budgetMax >= 2_000 && job.budgetMin <= 5_000
              : job.budgetMax > 5_000))
          && (!deadlineDays || daysRemaining <= deadlineDays);
      })
      .slice()
      .sort((a, b) => a.interestDeadline.localeCompare(b.interestDeadline));
  });

  readonly creatorsForYou = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.creatorDirectory()
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

  updateFilter(event: Event, filter: 'creatorNiche' | 'creatorTag' | 'creatorPlatform' | 'creatorAudience' | 'creatorEngagement' | 'creatorRate' | 'campaignCategory' | 'campaignBrand' | 'campaignStatus' | 'jobCategory' | 'jobBrand' | 'jobBudget' | 'jobDeadline'): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    const filters = {
      creatorNiche: this.creatorNicheFilter,
      creatorTag: this.creatorTagFilter,
      creatorPlatform: this.creatorPlatformFilter,
      creatorAudience: this.creatorAudienceFilter,
      creatorEngagement: this.creatorEngagementFilter,
      creatorRate: this.creatorRateFilter,
      campaignCategory: this.campaignCategoryFilter,
      campaignBrand: this.campaignBrandFilter,
      campaignStatus: this.campaignStatusFilter,
      jobCategory: this.jobCategoryFilter,
      jobBrand: this.jobBrandFilter,
      jobBudget: this.jobBudgetFilter,
      jobDeadline: this.jobDeadlineFilter
    };
    filters[filter].set(target.value);
  }

  selectOpportunityType(type: 'campaigns' | 'jobs'): void {
    this.selectedOpportunityType.set(type);
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
      { label: 'Content tags', value: creator.contentTags.join(', ') },
      { label: 'Audience', value: this.formatAudience(creator.audienceSize) },
      { label: 'Engagement', value: `${creator.engagementRate}%` },
      { label: 'Channels', value: creator.channels.join(', ') },
      { label: 'Typical rate', value: this.formatRate(creator.typicalRate) }
    ], 'CREATOR PROFILE');
  }

  showCampaign(campaign: DiscoveryCampaign): void {
    const workspaceCampaign = this.workspace.campaigns().find((item) => item.id === campaign.id);
    const relatedJobs = this.workspace.jobs()
      .filter((job) => job.campaignId === campaign.id || job.campaignTitle === campaign.title)
      .map((job) => ({
        title: job.title,
        subtitle: `${this.formatBudget(job.budgetMin, job.budgetMax)} · Interest closes ${this.formatDate(job.interestDeadline)}`,
        meta: `${Math.max(job.creatorCapacity - job.assignedCreatorIds.length, 0)} spots`
      }));
    const metrics = [
      { label: 'Category', value: campaign.category },
      { label: 'Interested creators', value: `${campaign.applicants}` }
    ];
    if (workspaceCampaign) {
      metrics.push(
        { label: 'Creator capacity', value: `${workspaceCampaign.creatorCapacity}` },
        { label: 'Jobs in campaign', value: `${relatedJobs.length}` }
      );
    } else {
      metrics.push({ label: 'Trending score', value: `${campaign.trendingScore}` });
    }

    this.dialogs.openOpportunity({
      opportunityType: 'Campaign',
      title: campaign.title,
      companyName: campaign.brandName,
      category: campaign.category,
      description: campaign.description,
      status: campaign.status,
      budget: campaign.budgetMax
        ? this.formatBudget(campaign.budgetMin, campaign.budgetMax)
        : 'Set per related job',
      metrics,
      relatedJobs
    });
  }

  isRegisteredForCampaign(campaignId: string): boolean {
    return this.workspace.isInterestedInCampaign(campaignId);
  }

  toggleCampaignInterest(campaignId: string): void {
    this.workspace.toggleCampaignInterest(campaignId);
  }

  isRegisteredForJob(jobId: string): boolean {
    return this.workspace.isInterestedInJob(jobId);
  }

  toggleJobInterest(jobId: string): void {
    this.workspace.toggleJobInterest(jobId);
  }

  isJobInterestOpen(job: JobOpportunity): boolean {
    return new Date(`${job.interestDeadline}T23:59:59`).getTime() >= Date.now();
  }

  showJob(job: JobOpportunity): void {
    this.dialogs.openOpportunity({
      opportunityType: 'Job',
      title: job.title,
      companyName: job.companyName,
      category: job.category,
      description: job.description,
      status: this.isJobInterestOpen(job) ? 'Accepting interest' : 'Interest closed',
      budget: this.formatBudget(job.budgetMin, job.budgetMax),
      metrics: [
        { label: 'Campaign', value: job.campaignTitle ?? 'Standalone job' },
        { label: 'Interest deadline', value: this.formatDate(job.interestDeadline) },
        { label: 'Delivery deadline', value: this.formatDate(job.deliveryDeadline) },
        { label: 'Creator spots', value: `${Math.max(job.creatorCapacity - job.assignedCreatorIds.length, 0)} of ${job.creatorCapacity} open` },
        { label: 'Interested creators', value: `${job.interestedCreatorIds.length}` }
      ],
      relatedJobs: []
    });
  }

  showCompany(company: CompanyAccount): void {
    this.dialogs.openDetails(company.name, company.description, [
      { label: 'Category', value: company.category },
      { label: 'Active campaigns', value: `${company.activeCampaigns}` },
      { label: 'Creator partners', value: `${company.creatorPartners}` },
      { label: 'Social profile', value: company.handle }
    ], 'BRAND PROFILE');
  }

  isRegisteredForBrand(brandId: string): boolean {
    return this.workspace.isInterestedInBrand(brandId);
  }

  toggleBrandInterest(brandId: string): void {
    this.workspace.toggleBrandInterest(brandId);
  }

  private creatorSearchText(creator: CreatorAccount): string {
    return `${creator.name} ${creator.handle} ${creator.niche} ${creator.contentTags.join(' ')} ${creator.bio} ${creator.channels.join(' ')}`.toLowerCase();
  }

  private campaignSearchText(campaign: DiscoveryCampaign | MarketplaceCampaign): string {
    return `${campaign.title} ${campaign.brandName} ${campaign.category} ${campaign.description}`.toLowerCase();
  }

  private companySearchText(company: CompanyAccount): string {
    return `${company.name} ${company.handle} ${company.category} ${company.description}`.toLowerCase();
  }

  private unique(values: string[]): string[] {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })
      .format(new Date(`${date}T12:00:00`));
  }
}
