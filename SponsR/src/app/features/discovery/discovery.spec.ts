import { TestBed } from '@angular/core/testing';
import { DiscoveryComponent } from './discovery';
import { SessionService } from '../../core/session.service';

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
});
