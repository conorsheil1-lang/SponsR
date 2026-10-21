import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DialogService } from '../../core/dialog.service';
import { MarketplaceWorkspaceService } from '../../core/marketplace-workspace.service';
import { CreatorPortalComponent } from './creator-portal';

describe('CreatorPortalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatorPortalComponent],
      providers: [provideRouter([])]
    }).compileComponents();
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

    const withdrawButton = fixture.nativeElement.querySelector('.registered-opportunities:last-child .withdraw-button') as HTMLButtonElement;
    withdrawButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No brands saved yet');
    expect(workspace.isInterestedInBrand('brand-morrow')).toBe(false);
  });

  it('opens full profile and campaign matching lists in dialogs without expanding the cards', () => {
    const fixture = TestBed.createComponent(CreatorPortalComponent);
    const dialogs = TestBed.inject(DialogService);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.content-grid > .panel-card');
    const matchesCard = cards[0] as HTMLElement;
    const linksCard = cards[1] as HTMLElement;

    expect(matchesCard.querySelectorAll('li')).toHaveLength(3);
    (matchesCard.querySelector('.show-more-button') as HTMLButtonElement).click();
    const campaignDialog = dialogs.activeDialog();
    expect(campaignDialog?.kind).toBe('list');
    if (campaignDialog?.kind !== 'list') {
      throw new Error('Expected campaign matches list dialog.');
    }
    expect(campaignDialog.items).toHaveLength(5);
    expect(matchesCard.querySelectorAll('li')).toHaveLength(3);

    expect(linksCard.querySelectorAll('li')).toHaveLength(3);
    (linksCard.querySelector('.show-more-button') as HTMLButtonElement).click();
    const linksDialog = dialogs.activeDialog();
    if (linksDialog?.kind !== 'list') {
      throw new Error('Expected social links list dialog.');
    }
    expect(linksDialog.items).toHaveLength(5);
    expect(linksCard.querySelectorAll('li')).toHaveLength(3);
  });
});
