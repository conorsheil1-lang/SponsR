import { DiscoveryComponent } from './discovery';

describe('DiscoveryComponent', () => {
  it('provides multiple creators, campaigns, and brands sorted by their current scores', () => {
    const component = new DiscoveryComponent();

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
    const component = new DiscoveryComponent();
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
});
