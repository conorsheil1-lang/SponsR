import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
});
