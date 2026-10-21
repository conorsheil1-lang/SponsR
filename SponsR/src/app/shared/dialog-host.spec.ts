import { TestBed } from '@angular/core/testing';
import { DialogService } from '../core/dialog.service';
import { MarketplaceWorkspaceService } from '../core/marketplace-workspace.service';
import { SessionService } from '../core/session.service';
import { DialogHostComponent } from './dialog-host';

describe('DialogHostComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({ imports: [DialogHostComponent] }).compileComponents();
  });

  it('shows the job and campaign creation forms and adds their records to shared workspace data', () => {
    TestBed.inject(SessionService).signIn({
      type: 'company',
      name: 'Northstar Labs',
      email: 'company@sponsr.com'
    });
    const dialogs = TestBed.inject(DialogService);
    const workspace = TestBed.inject(MarketplaceWorkspaceService);
    const fixture = TestBed.createComponent(DialogHostComponent);

    dialogs.openCreateCampaign();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Create a campaign');
    expect(fixture.nativeElement.querySelector('[name="campaignTitle"]')).toBeTruthy();
    dialogs.close();

    dialogs.openCreateJob();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Create a job');
    expect(fixture.nativeElement.querySelector('[name="jobTitle"]')).toBeTruthy();

    workspace.addCampaign({
      companyName: 'Northstar Labs',
      title: 'Spring creator series',
      category: 'Technology',
      description: 'A seasonal creator partnership.',
      creatorCapacity: 5
    });
    workspace.addJob({
      campaignId: null,
      companyName: 'Northstar Labs',
      title: 'Spring launch video',
      category: 'Technology',
      description: 'Create a short-form product story.',
      budgetMin: 1000,
      budgetMax: 3000,
      interestDeadline: '2026-11-01',
      deliveryDeadline: '2026-11-15',
      creatorCapacity: 3
    });

    expect(workspace.campaigns()[0].title).toBe('Spring creator series');
    expect(workspace.jobs()[0].title).toBe('Spring launch video');
    expect(workspace.jobs()[0].companyName).toBe('Northstar Labs');
  });

  it('renders rich campaign and job opportunity details', () => {
    const dialogs = TestBed.inject(DialogService);
    const fixture = TestBed.createComponent(DialogHostComponent);

    dialogs.openOpportunity({
      opportunityType: 'Campaign',
      title: 'Spring creator series',
      companyName: 'Northstar Labs',
      category: 'Technology',
      description: 'A seasonal creator partnership.',
      status: 'Open',
      budget: '$1,000–$3,000',
      metrics: [
        { label: 'Interested creators', value: '12' },
        { label: 'Creator capacity', value: '5' }
      ],
      relatedJobs: [{
        title: 'Spring launch video',
        subtitle: '$1,000–$3,000 · Interest closes Nov 1, 2026',
        meta: '3 spots'
      }]
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.opportunity-hero')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Northstar Labs');
    expect(fixture.nativeElement.textContent).toContain('$1,000–$3,000');
    expect(fixture.nativeElement.textContent).toContain('Spring launch video');
    expect(fixture.nativeElement.textContent).toContain('Interested creators');

    dialogs.close();
    dialogs.openOpportunity({
      opportunityType: 'Job',
      title: 'Spring launch video',
      companyName: 'Northstar Labs',
      category: 'Technology',
      description: 'Create a short-form product story.',
      status: 'Accepting interest',
      budget: '$1,000–$3,000',
      metrics: [{ label: 'Delivery deadline', value: 'Nov 15, 2026' }],
      relatedJobs: []
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Delivery deadline');
    expect(fixture.nativeElement.textContent).not.toContain('Jobs in this campaign');
  });
});
