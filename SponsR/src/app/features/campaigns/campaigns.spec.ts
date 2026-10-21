import { TestBed } from '@angular/core/testing';
import { creatorProposals } from '../../core/creator-workspace-data';
import { SessionService } from '../../core/session.service';
import { CampaignsComponent } from './campaigns';

describe('CampaignsComponent', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows creators only campaigns connected to an accepted job proposal', async () => {
    await TestBed.configureTestingModule({ imports: [CampaignsComponent] }).compileComponents();
    TestBed.inject(SessionService).signIn({
      type: 'creator',
      name: 'Maya Chen',
      email: 'creator@sponsr.com'
    });

    const fixture = TestBed.createComponent(CampaignsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Campaigns linked to jobs with proposals you have accepted');
    expect(fixture.nativeElement.querySelector('.campaign-opportunity-card')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('accepted standalone jobs appear under Jobs');
    expect(fixture.nativeElement.textContent).not.toContain('Register interest');
  });

  it('keeps company campaign management visible', async () => {
    await TestBed.configureTestingModule({ imports: [CampaignsComponent] }).compileComponents();
    TestBed.inject(SessionService).signIn({
      type: 'company',
      name: 'Northstar Labs',
      email: 'company@sponsr.com'
    });

    const fixture = TestBed.createComponent(CampaignsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tools for what’s next');
    expect(fixture.nativeElement.textContent).toContain('Create campaign');
    expect(fixture.nativeElement.textContent).not.toContain('No campaigns yet');
  });

  it('includes a creator campaign only when its related job proposal is accepted', async () => {
    await TestBed.configureTestingModule({ imports: [CampaignsComponent] }).compileComponents();
    TestBed.inject(SessionService).signIn({
      type: 'creator',
      name: 'Maya Chen',
      email: 'creator@sponsr.com'
    });

    const acceptedProposal = creatorProposals.find((proposal) => proposal.status === 'Accepted');
    if (!acceptedProposal) {
      throw new Error('Expected mock accepted proposal.');
    }
    const previousCampaign = acceptedProposal.campaign;
    const previousBrand = acceptedProposal.brand;
    acceptedProposal.campaign = 'Tools for what’s next';
    acceptedProposal.brand = 'Northstar Labs';

    try {
      const fixture = TestBed.createComponent(CampaignsComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Tools for what’s next');
      expect(fixture.nativeElement.textContent).toContain('Accepted partnership');
      expect(fixture.nativeElement.textContent).not.toContain('The slower mornings series');
      expect(fixture.nativeElement.textContent).not.toContain('Register interest');
    } finally {
      acceptedProposal.campaign = previousCampaign;
      acceptedProposal.brand = previousBrand;
    }
  });
});
