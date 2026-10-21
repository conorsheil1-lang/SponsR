import { TestBed } from '@angular/core/testing';
import { DialogService } from '../../core/dialog.service';
import { MarketplaceWorkspaceService } from '../../core/marketplace-workspace.service';
import { SessionService } from '../../core/session.service';
import { ProposalsComponent } from './proposals';

describe('ProposalsComponent', () => {
  it('shows creator proposal status and amount', async () => {
    await TestBed.configureTestingModule({ imports: [ProposalsComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ProposalsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Your proposals');
    expect(fixture.nativeElement.textContent).toContain('Shortlisted');
    expect(fixture.nativeElement.textContent).toContain('Mint & Moss');
  });

  it('shows sent offers to companies and opens their proposal details', async () => {
    await TestBed.configureTestingModule({ imports: [ProposalsComponent] }).compileComponents();
    TestBed.inject(SessionService).signIn({
      type: 'company',
      name: 'Northstar Labs',
      email: 'company@sponsr.com'
    });
    const workspace = TestBed.inject(MarketplaceWorkspaceService);
    workspace.sendCompanyProposal({
      creatorId: 'creator-theo-brooks',
      opportunityType: 'Job',
      opportunityId: 'job-northstar-tools',
      amount: 4700,
      deliverables: 'One video',
      platforms: 'YouTube',
      timeline: 'Publish by Nov 20',
      usageRights: 'Organic usage for 90 days',
      brief: 'Show the product in a real workflow.'
    }, 'Northstar Labs');

    const fixture = TestBed.createComponent(ProposalsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Proposals to creators');
    expect(fixture.nativeElement.textContent).toContain('Theo Brooks');
    expect(fixture.nativeElement.textContent).toContain('$4,700');
    (fixture.nativeElement.querySelector('.proposal-view-button') as HTMLButtonElement).click();
    const proposalDialog = TestBed.inject(DialogService).activeDialog();
    expect(proposalDialog?.kind).toBe('company-proposal');
  });

  it('shows received company proposals to the intended creator', async () => {
    await TestBed.configureTestingModule({ imports: [ProposalsComponent] }).compileComponents();
    const workspace = TestBed.inject(MarketplaceWorkspaceService);
    workspace.sendCompanyProposal({
      creatorId: 'creator-theo-brooks',
      opportunityType: 'Job',
      opportunityId: 'job-northstar-tools',
      amount: 4700,
      deliverables: 'One video',
      platforms: 'YouTube',
      timeline: 'Publish by Nov 20',
      usageRights: 'Organic usage for 90 days',
      brief: 'Show the product in a real workflow.'
    }, 'Northstar Labs');
    TestBed.inject(SessionService).signIn({
      type: 'creator',
      accountId: 'creator-theo-brooks',
      name: 'Theo Brooks',
      email: 'theo@example.com'
    });

    const fixture = TestBed.createComponent(ProposalsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Proposals sent to you');
    expect(fixture.nativeElement.textContent).toContain('Northstar Labs');
    expect(fixture.nativeElement.textContent).toContain('$4,700');
  });
});
