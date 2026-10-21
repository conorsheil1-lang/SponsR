import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
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

    (fixture.nativeElement.querySelector('.registered-view-button') as HTMLButtonElement).click();
    const campaignDialog = TestBed.inject(DialogService).activeDialog();
    expect(campaignDialog?.kind).toBe('opportunity');
    if (campaignDialog?.kind !== 'opportunity') {
      throw new Error('Expected the registered campaign opportunity dialog.');
    }
    expect(campaignDialog.title).toBe('Make room for a reset');
    TestBed.inject(DialogService).close();

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

  it('edits creator name, handle, bio, and profile photo in the My Profile card', () => {
    const fixture = TestBed.createComponent(CreatorPortalComponent);
    fixture.detectChanges();
    const meLauncher = Array.from(fixture.nativeElement.querySelectorAll('.content-launch-card') as NodeListOf<HTMLButtonElement>)
      .find((button) => button.textContent?.includes('My Profile'));
    if (!meLauncher) {
      throw new Error('Expected a My Profile content card.');
    }
    meLauncher.click();
    fixture.detectChanges();
    const meDialog = fixture.nativeElement.querySelector('.content-dialog') as HTMLElement;
    expect(meDialog.querySelector('h2')?.textContent).toBe('My Profile');

    const nameInput = meDialog.querySelector('[name="creatorName"]') as HTMLInputElement;
    nameInput.value = 'Maya C.';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    const handleInput = meDialog.querySelector('[name="creatorHandle"]') as HTMLInputElement;
    handleInput.value = '@mayacreates';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    const bioInput = meDialog.querySelector('[name="creatorBio"]') as HTMLTextAreaElement;
    bioInput.value = 'Recipes and home inspiration.';
    bioInput.dispatchEvent(new Event('input', { bubbles: true }));
    (meDialog.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const profile = TestBed.inject(CreatorProfileService).profile;
    expect(profile().name).toBe('Maya C.');
    expect(profile().handle).toBe('@mayacreates');
    expect(profile().bio).toBe('Recipes and home inspiration.');
    expect(meDialog.textContent).toContain('Profile saved.');

    const avatarInput = meDialog.querySelector('[type="file"]') as HTMLInputElement;
    Object.defineProperty(avatarInput, 'files', {
      value: [new File(['mock image'], 'profile.png', { type: 'image/png' })]
    });
    class MockFileReader extends FileReader {
      override readAsDataURL(_blob: Blob): void {
        Object.defineProperty(this, 'result', { value: 'data:image/png;base64,bW9jayBpbWFnZQ==' });
        this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);
    avatarInput.dispatchEvent(new Event('change', { bubbles: true }));
    vi.unstubAllGlobals();
    fixture.detectChanges();
    expect(profile().avatarUrl).toMatch(/^data:image\/png;base64,/);
    expect(meDialog.querySelector('.creator-avatar-image img')).toBeTruthy();
  });

  it('opens Rates in a dialog and adds/removes priced content rates with video duration', () => {
    const fixture = TestBed.createComponent(CreatorPortalComponent);
    fixture.detectChanges();
    const ratesLauncher = Array.from(fixture.nativeElement.querySelectorAll('.content-launch-card') as NodeListOf<HTMLButtonElement>)
      .find((button) => button.textContent?.includes('Rates'));
    if (!ratesLauncher) {
      throw new Error('Expected Rates card in My Content.');
    }
    expect(fixture.nativeElement.textContent).not.toContain('Audience');
    ratesLauncher.click();
    fixture.detectChanges();
    const rates = fixture.nativeElement.querySelector('.content-dialog') as HTMLElement;
    expect(rates.querySelector('h2')?.textContent).toBe('Rates');
    expect(rates.querySelectorAll('.rate-card-item')).toHaveLength(3);

    const component = fixture.componentInstance;
    const durationInput = rates.querySelector('[name="rateDuration"]') as HTMLInputElement;
    expect(durationInput).toBeTruthy();
    durationInput.value = '2';
    durationInput.dispatchEvent(new Event('input', { bubbles: true }));
    const priceInput = rates.querySelector('[name="ratePrice"]') as HTMLInputElement;
    priceInput.value = '1500';
    priceInput.dispatchEvent(new Event('input', { bubbles: true }));
    (rates.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const profile = TestBed.inject(CreatorProfileService).profile;
    expect(profile().rateCard).toHaveLength(4);
    expect(profile().rateCard[3]).toEqual({
      deliverable: 'Video',
      platform: 'Instagram',
      rate: 1500,
      currency: 'USD',
      durationMinutes: 2
    });
    expect(rates.textContent).toContain('Video · 2 min');
    expect(rates.textContent).toContain('$1,500');

    component.removeRateCardItem(3);
    fixture.detectChanges();
    expect(profile().rateCard).toHaveLength(3);
  });

  it('groups registered campaigns and brands under My Interests and opens social links in a dialog', () => {
    const fixture = TestBed.createComponent(CreatorPortalComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.section-heading')?.textContent?.trim()).toBe('My Content');
    expect(fixture.nativeElement.textContent).not.toContain('Campaigns matching your profile');
    const interestsHeading = fixture.nativeElement.querySelector('.interests-section-heading') as HTMLElement;
    expect(interestsHeading.textContent?.trim()).toBe('My Interests');
    const registeredCards = Array.from(fixture.nativeElement.querySelectorAll('.registered-opportunities')) as HTMLElement[];
    const linksLauncher = Array.from(fixture.nativeElement.querySelectorAll('.content-launch-card') as NodeListOf<HTMLButtonElement>)
      .find((button) => button.textContent?.includes('Profile & social links'));

    if (registeredCards.length !== 2 || !linksLauncher) {
      throw new Error('Expected two registered interest cards and a social links card.');
    }

    expect(interestsHeading.compareDocumentPosition(registeredCards[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(interestsHeading.compareDocumentPosition(registeredCards[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    linksLauncher.click();
    fixture.detectChanges();
    const linksCard = fixture.nativeElement.querySelector('.content-dialog') as HTMLElement;
    expect(linksCard.querySelectorAll('.social-profile-row')).toHaveLength(3);
    expect(linksCard.textContent).toContain('@mayamakes');
    expect(linksCard.querySelector('.social-profile-row a')?.getAttribute('href')).toBe('https://instagram.com/mayamakes');
    expect(linksCard.querySelector('.profile-editor-form')).toBeTruthy();
  });

  it('adds suggested and custom content tags and links new social platforms', async () => {
    const fixture = TestBed.createComponent(CreatorPortalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const tagsLauncher = Array.from(fixture.nativeElement.querySelectorAll('.content-launch-card') as NodeListOf<HTMLButtonElement>)
      .find((button) => button.textContent?.includes('Content tags'));
    if (!tagsLauncher) {
      throw new Error('Expected Content tags card.');
    }
    tagsLauncher.click();
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

    (fixture.nativeElement.querySelector('.dialog-close-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    const socialLauncher = Array.from(fixture.nativeElement.querySelectorAll('.content-launch-card') as NodeListOf<HTMLButtonElement>)
      .find((button) => button.textContent?.includes('Profile & social links'));
    if (!socialLauncher) {
      throw new Error('Expected Profile & social links card.');
    }
    socialLauncher.click();
    fixture.detectChanges();
    const socialDialog = fixture.nativeElement.querySelector('.content-dialog') as HTMLElement;
    const platformInput = socialDialog.querySelector('[name="socialPlatform"]') as HTMLSelectElement;
    platformInput.value = 'Twitch';
    platformInput.dispatchEvent(new Event('change', { bubbles: true }));
    const handleInput = socialDialog.querySelector('[name="socialHandle"]') as HTMLInputElement;
    handleInput.value = '@mayamakesvideo';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    const urlInput = socialDialog.querySelector('[name="socialUrl"]') as HTMLInputElement;
    urlInput.value = 'https://twitch.tv/mayamakesvideo';
    urlInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    component.addSocialLink();
    fixture.detectChanges();
    expect(socialDialog.querySelector('.profile-error')?.textContent).toBeFalsy();
    const socialLinks = socialDialog.querySelectorAll('.social-profile-row');
    expect(socialLinks).toHaveLength(4);
    expect(socialDialog.textContent).toContain('@mayamakesvideo');
    const profile = TestBed.inject(CreatorProfileService).profile;
    expect(profile().channels).toContain('Twitch');

    component.removeSocialLink('Twitch');
    component.removeContentTag('tech');
    fixture.detectChanges();
    expect(profile().socialLinks.some((link) => link.platform === 'Twitch')).toBe(false);
    expect(profile().contentTags).not.toContain('tech');
  });
});
