import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DialogService } from '../../core/dialog.service';
import { MarketplaceWorkspaceService } from '../../core/marketplace-workspace.service';
import { CreatorProfileService } from '../../core/creator-profile.service';
import { SessionService } from '../../core/session.service';
import { CreatorPortalComponent } from './creator-portal';

describe('CreatorPortalComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CreatorPortalComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('remembers hiding the introduction separately for each creator', () => {
    const session = TestBed.inject(SessionService);
    session.signIn({ type: 'creator', accountId: 'creator-maya', name: 'Maya Chen', email: 'maya@example.com' });

    const firstFixture = TestBed.createComponent(CreatorPortalComponent);
    firstFixture.detectChanges();
    expect(firstFixture.nativeElement.querySelector('.portal-banner')).toBeTruthy();
    (firstFixture.nativeElement.querySelector('.dismiss-banner-button') as HTMLButtonElement).click();
    firstFixture.detectChanges();
    expect(firstFixture.nativeElement.querySelector('.portal-banner')).toBeNull();

    firstFixture.destroy();
    session.signIn({ type: 'creator', accountId: 'creator-eli', name: 'Eli Williams', email: 'eli@example.com' });
    const secondFixture = TestBed.createComponent(CreatorPortalComponent);
    secondFixture.detectChanges();
    expect(secondFixture.nativeElement.querySelector('.portal-banner')).toBeTruthy();
  });

  it('shows registered campaigns and jobs, and allows switching and withdrawing interest', () => {
    const workspace = TestBed.inject(MarketplaceWorkspaceService);
    workspace.toggleCampaignInterest('campaign-morrow-reset');
    workspace.toggleJobInterest('job-morrow-reset');

    const fixture = TestBed.createComponent(CreatorPortalComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Make room for a reset');
    expect(fixture.nativeElement.textContent).toContain('Morrow · Wellness');
    expect(fixture.nativeElement.querySelector('.registered-opportunities li')).toBeTruthy();

    const jobsToggle = fixture.nativeElement.querySelector('.interest-toggle button:last-child') as HTMLButtonElement;
    jobsToggle.click();
    fixture.detectChanges();

    expect(jobsToggle.getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Make room for a reset');
    expect(fixture.nativeElement.textContent).toContain('Due');

    (fixture.nativeElement.querySelector('.withdraw-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No job registrations yet');
    expect(workspace.isInterestedInJob('job-morrow-reset')).toBe(false);
  });

  it('shows registered brands and allows withdrawing brand interest', () => {
    const workspace = TestBed.inject(MarketplaceWorkspaceService);
    workspace.toggleBrandInterest('brand-morrow');

    const fixture = TestBed.createComponent(CreatorPortalComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Brands you’re interested in');
    expect(fixture.nativeElement.textContent).toContain('Morrow');
    expect(fixture.nativeElement.textContent).toContain('Wellness · 8 open campaigns');

    const withdrawButton = fixture.nativeElement.querySelector('.registered-opportunities .withdraw-button') as HTMLButtonElement;
    withdrawButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No brands saved yet');
    expect(workspace.isInterestedInBrand('brand-morrow')).toBe(false);
  });

  it('opens campaign matches in a dialog and displays linked social profiles', () => {
    const fixture = TestBed.createComponent(CreatorPortalComponent);
    const dialogs = TestBed.inject(DialogService);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.section-heading')?.textContent?.trim()).toBe('My Content');
    const cards = Array.from(fixture.nativeElement.querySelectorAll('.content-grid > .panel-card')) as HTMLElement[];
    const matchesCard = cards.find((card) => card.querySelector('h3')?.textContent?.includes('Campaigns matching your profile'));
    const linksCard = cards.find((card) => card.querySelector('h3')?.textContent?.includes('Profile & social links'));
    const registeredInterestsCard = cards.find((card) => card.querySelector('h3')?.textContent?.includes('Registered interest'));

    if (!matchesCard || !linksCard || !registeredInterestsCard) {
      throw new Error('Expected campaign matches, social links, and registered interests cards.');
    }

    expect(cards.indexOf(matchesCard)).toBeGreaterThan(cards.indexOf(registeredInterestsCard));
    expect(matchesCard.querySelectorAll('li')).toHaveLength(3);
    (matchesCard.querySelector('.show-more-button') as HTMLButtonElement).click();
    const campaignDialog = dialogs.activeDialog();
    expect(campaignDialog?.kind).toBe('list');
    if (campaignDialog?.kind !== 'list') {
      throw new Error('Expected campaign matches list dialog.');
    }
    expect(campaignDialog.items).toHaveLength(5);
    expect(matchesCard.querySelectorAll('li')).toHaveLength(3);

    expect(linksCard.querySelectorAll('.social-profile-row')).toHaveLength(3);
    expect(linksCard.textContent).toContain('@mayamakes');
    expect(linksCard.querySelector('.social-profile-row a')?.getAttribute('href')).toBe('https://instagram.com/mayamakes');
    expect(linksCard.querySelector('.profile-editor-form')).toBeTruthy();
  });

  it('adds suggested and custom content tags and links new social platforms', async () => {
    const fixture = TestBed.createComponent(CreatorPortalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const suggestedTag = Array.from(fixture.nativeElement.querySelectorAll('.tag-suggestions button') as NodeListOf<HTMLButtonElement>)
      .find((button) => button.textContent?.includes('tech'));
    if (!suggestedTag) {
      throw new Error('Expected suggested tech tag.');
    }
    suggestedTag.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.creator-content-tags')?.textContent).toContain('tech');

    component.addTag('slow living');
    fixture.detectChanges();
    expect(TestBed.inject(CreatorProfileService).profile().contentTags).toContain('slow living');

    const platformInput = fixture.nativeElement.querySelector('[name="socialPlatform"]') as HTMLSelectElement;
    platformInput.value = 'Twitch';
    platformInput.dispatchEvent(new Event('change', { bubbles: true }));
    const handleInput = fixture.nativeElement.querySelector('[name="socialHandle"]') as HTMLInputElement;
    handleInput.value = '@mayamakesvideo';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    const urlInput = fixture.nativeElement.querySelector('[name="socialUrl"]') as HTMLInputElement;
    urlInput.value = 'https://twitch.tv/mayamakesvideo';
    urlInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    component.addSocialLink();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile-error')?.textContent).toBeFalsy();
    const socialLinks = fixture.nativeElement.querySelectorAll('.social-profile-row');
    expect(socialLinks).toHaveLength(4);
    expect(fixture.nativeElement.textContent).toContain('@mayamakesvideo');
    const profile = TestBed.inject(CreatorProfileService).profile;
    expect(profile().channels).toContain('Twitch');

    component.removeSocialLink('Twitch');
    component.removeContentTag('tech');
    fixture.detectChanges();
    expect(profile().socialLinks.some((link) => link.platform === 'Twitch')).toBe(false);
    expect(profile().contentTags).not.toContain('tech');
  });
});
