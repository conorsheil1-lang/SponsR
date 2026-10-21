import { TestBed } from '@angular/core/testing';
import { DiscoveryComponent } from './discovery';
import { SessionService } from '../../core/session.service';
import { DialogService } from '../../core/dialog.service';

describe('DiscoveryComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({ imports: [DiscoveryComponent] }).compileComponents();
  });

  it('provides multiple creators, campaigns, and brands sorted by their current scores', () => {
    const component = TestBed.runInInjectionContext(() => new DiscoveryComponent());

    expect(component.hotCreators().length).toBeGreaterThan(5);
    expect(component.hotCampaigns().length).toBeGreaterThan(5);
    expect(component.popularCompanies().length).toBeGreaterThan(5);

    expect(component.hotCreators().map((creator) => creator.trendingScore)).toEqual(
      [...component.hotCreators().map((creator) => creator.trendingScore)].sort((a, b) => b - a)
    );
    expect(component.hotCampaigns().map((campaign) => campaign.trendingScore)).toEqual(
      [...component.hotCampaigns().map((campaign) => campaign.trendingScore)].sort((a, b) => b - a)
    );
    expect(component.popularCompanies().map((company) => company.popularityScore)).toEqual(
      [...component.popularCompanies().map((company) => company.popularityScore)].sort((a, b) => b - a)
    );
  });

  it('re-sorts when account scores change and applies search across all sections', () => {
    const component = TestBed.runInInjectionContext(() => new DiscoveryComponent());
    const creators = component.creators();
    component.creators.set([
      { ...creators[1], trendingScore: 100 },
      { ...creators[0], trendingScore: 1 },
      ...creators.slice(2)
    ]);

    expect(component.hotCreators()[0].id).toBe(creators[1].id);

    component.searchQuery.set('coffee');

    expect(component.hotCreators()).toHaveLength(0);
    expect(component.hotCampaigns().map((campaign) => campaign.brandId)).toContain('brand-goodfolk');
    expect(component.popularCompanies().map((company) => company.id)).toEqual(['brand-goodfolk']);
  });

  it('shows creators only for company users', () => {
    TestBed.inject(SessionService).signIn({ type: 'company', name: 'Northstar Labs', email: 'company@sponsr.com' });
    const fixture = TestBed.createComponent(DiscoveryComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Creators for you');
    expect(fixture.nativeElement.textContent).toContain('Hot creators');
    expect(fixture.nativeElement.textContent).not.toContain('Hot campaigns');
    expect(fixture.nativeElement.textContent).not.toContain('Popular brands');
  });

  it('shows campaigns and brands but not creators for creator users', () => {
    TestBed.inject(SessionService).signIn({ type: 'creator', name: 'Maya Chen', email: 'creator@sponsr.com' });
    const fixture = TestBed.createComponent(DiscoveryComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Hot campaigns');
    expect(fixture.nativeElement.textContent).toContain('Popular brands');
    expect(fixture.nativeElement.textContent).not.toContain('Hot creators');
    expect(fixture.nativeElement.textContent).not.toContain('Creators for you');
  });

  it('filters all creators by niche, platform, audience, engagement, and rate', () => {
    TestBed.inject(SessionService).signIn({ type: 'company', name: 'Northstar Labs', email: 'company@sponsr.com' });
    const fixture = TestBed.createComponent(DiscoveryComponent);
    const component = fixture.componentInstance;

    component.creatorNicheFilter.set('Technology');
    expect(component.allCreators().length).toBeGreaterThan(0);
    expect(component.allCreators().every((creator) => creator.niche === 'Technology')).toBe(true);

    component.creatorNicheFilter.set('');
    component.creatorPlatformFilter.set('Twitch');
    expect(component.allCreators().map((creator) => creator.name)).toEqual(['Eli Williams']);

    component.creatorPlatformFilter.set('');
    component.creatorAudienceFilter.set('over-500k');
    expect(component.allCreators().every((creator) => creator.audienceSize >= 500_000)).toBe(true);

    component.creatorAudienceFilter.set('');
    component.creatorEngagementFilter.set('10');
    expect(component.allCreators().every((creator) => creator.engagementRate >= 10)).toBe(true);

    component.creatorEngagementFilter.set('');
    component.creatorRateFilter.set('2000');
    expect(component.allCreators().every((creator) => creator.typicalRate <= 2_000)).toBe(true);
  });

  it('filters all campaigns and jobs by tag, brand, budget, and deadline', () => {
    TestBed.inject(SessionService).signIn({ type: 'creator', name: 'Maya Chen', email: 'creator@sponsr.com' });
    const fixture = TestBed.createComponent(DiscoveryComponent);
    const component = fixture.componentInstance;

    expect(component.campaignCategories()).toContain('Fitness');
    expect(component.jobCategories()).toContain('Fitness');
    expect(component.jobCategories()).toContain('Technology');
    expect(component.jobCategories()).toContain('Wellness');

    component.campaignCategoryFilter.set('Fitness');
    expect(component.allCampaigns().length).toBeGreaterThan(0);
    expect(component.allCampaigns().every((campaign) => campaign.category === 'Fitness')).toBe(true);

    component.campaignCategoryFilter.set('');
    component.campaignBrandFilter.set('Velora Health');
    expect(component.allCampaigns().every((campaign) => campaign.brandName === 'Velora Health')).toBe(true);

    component.campaignBrandFilter.set('');
    component.jobCategoryFilter.set('Fitness');
    expect(component.allJobs().length).toBeGreaterThan(0);
    expect(component.allJobs().every((job) => job.category === 'Fitness')).toBe(true);

    component.jobCategoryFilter.set('');
    component.jobBrandFilter.set('Velora Health');
    expect(component.allJobs().every((job) => job.companyName === 'Velora Health')).toBe(true);

    component.jobBrandFilter.set('');
    component.jobBudgetFilter.set('under-2k');
    expect(component.allJobs().every((job) => job.budgetMin < 2_000)).toBe(true);

    component.jobBudgetFilter.set('');
    component.jobDeadlineFilter.set('14');
    expect(component.allJobs().every((job) =>
      new Date(`${job.interestDeadline}T23:59:59`).getTime() - Date.now() <= 14 * 86_400_000
    )).toBe(true);
  });

  it('toggles the creator all-opportunities section between campaigns and jobs', () => {
    TestBed.inject(SessionService).signIn({ type: 'creator', name: 'Maya Chen', email: 'creator@sponsr.com' });
    const fixture = TestBed.createComponent(DiscoveryComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#all-opportunities-heading')?.textContent).toContain('All campaigns');
    expect(fixture.nativeElement.querySelector('[aria-label="Filter campaigns"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[aria-label="Filter jobs"]')).toBeNull();

    const jobsToggle = fixture.nativeElement.querySelector('.opportunity-toggle button:last-child') as HTMLButtonElement;
    jobsToggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#all-opportunities-heading')?.textContent).toContain('All jobs');
    expect(fixture.nativeElement.querySelector('[aria-label="Filter campaigns"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Filter jobs"]')).toBeTruthy();
    expect(jobsToggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('lets creators register and withdraw interest in campaigns and jobs', () => {
    TestBed.inject(SessionService).signIn({ type: 'creator', name: 'Maya Chen', email: 'creator@sponsr.com' });
    const fixture = TestBed.createComponent(DiscoveryComponent);
    fixture.detectChanges();

    const campaignCard = fixture.nativeElement.querySelector('.listing-card.campaign-card') as HTMLElement;
    const campaignButton = campaignCard.querySelector('.interest-toggle-button') as HTMLButtonElement;
    expect(campaignButton.textContent).toContain('Register interest');
    campaignButton.click();
    fixture.detectChanges();
    expect(campaignButton.textContent).toContain('Interested');

    fixture.nativeElement.querySelector('.opportunity-toggle button:last-child').click();
    fixture.detectChanges();
    const jobButton = fixture.nativeElement.querySelector('.job-listing-card .interest-toggle-button') as HTMLButtonElement;
    expect(jobButton.textContent).toContain('Register interest');
    jobButton.click();
    fixture.detectChanges();
    expect(jobButton.textContent).toContain('Interested');

    jobButton.click();
    fixture.detectChanges();
    expect(jobButton.textContent).toContain('Register interest');
  });

  it('does not expose creator registration actions to companies', () => {
    TestBed.inject(SessionService).signIn({ type: 'company', name: 'Northstar Labs', email: 'company@sponsr.com' });
    const fixture = TestBed.createComponent(DiscoveryComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.interest-toggle-button')).toBeNull();
  });

  it('lets creators register interest in brands and withdraw it', () => {
    TestBed.inject(SessionService).signIn({ type: 'creator', name: 'Maya Chen', email: 'creator@sponsr.com' });
    const fixture = TestBed.createComponent(DiscoveryComponent);
    fixture.detectChanges();

    const brandCard = fixture.nativeElement.querySelector('.brand-card') as HTMLElement;
    const brandButton = brandCard.querySelector('.interest-toggle-button') as HTMLButtonElement;
    expect(brandButton.textContent).toContain('Register interest');

    brandButton.click();
    fixture.detectChanges();
    expect(brandButton.textContent).toContain('Interested');
    expect(fixture.componentInstance.isRegisteredForBrand(fixture.componentInstance.popularCompanies()[0].id)).toBe(true);

    brandButton.click();
    fixture.detectChanges();
    expect(brandButton.textContent).toContain('Register interest');
  });

  it('opens detailed campaign and job dialogs from opportunity cards', () => {
    TestBed.inject(SessionService).signIn({ type: 'creator', name: 'Maya Chen', email: 'creator@sponsr.com' });
    const fixture = TestBed.createComponent(DiscoveryComponent);
    const dialogs = TestBed.inject(DialogService);
    fixture.detectChanges();

    fixture.componentInstance.showCampaign(fixture.componentInstance.allCampaigns()[0]);
    const campaignDialog = dialogs.activeDialog();
    expect(campaignDialog?.kind).toBe('opportunity');
    if (campaignDialog?.kind !== 'opportunity') {
      throw new Error('Expected campaign opportunity dialog.');
    }
    expect(campaignDialog.opportunityType).toBe('Campaign');
    expect(campaignDialog.metrics.map((metric) => metric.label)).toContain('Interested creators');

    const job = fixture.componentInstance.allJobs()[0];
    fixture.componentInstance.showJob(job);
    const jobDialog = dialogs.activeDialog();
    expect(jobDialog?.kind).toBe('opportunity');
    if (jobDialog?.kind !== 'opportunity') {
      throw new Error('Expected job opportunity dialog.');
    }
    expect(jobDialog.metrics.map((metric) => metric.label)).toContain('Interest deadline');
    expect(jobDialog.metrics.map((metric) => metric.label)).toContain('Creator spots');
  });
});
