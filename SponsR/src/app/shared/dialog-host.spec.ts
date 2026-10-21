import { TestBed } from '@angular/core/testing';
import { DialogService } from '../core/dialog.service';
import { creatorProposals } from '../core/creator-workspace-data';
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
      creatorCapacity: 3,
      requiresContentReview: true
    });

    expect(workspace.campaigns()[0].title).toBe('Spring creator series');
    expect(workspace.jobs()[0].title).toBe('Spring launch video');
    expect(workspace.jobs()[0].companyName).toBe('Northstar Labs');
    expect(workspace.jobs()[0].requiresContentReview).toBe(true);
  });

  it('lets creators submit a deliverable link and shows the review status', () => {
    TestBed.inject(SessionService).signIn({
      type: 'creator',
      name: 'Maya Chen',
      email: 'creator@sponsr.com'
    });
    const dialogs = TestBed.inject(DialogService);
    const workspace = TestBed.inject(MarketplaceWorkspaceService);
    const job = workspace.jobs().find((candidate) => candidate.id === 'job-mint-home');
    const proposal = creatorProposals.find((candidate) => candidate.id === 'proposal-mint-home');
    if (!job || !proposal) {
      throw new Error('Expected the accepted job and proposal mock data.');
    }
    const fixture = TestBed.createComponent(DialogHostComponent);

    dialogs.openCreatorJob(job, proposal);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Agreed deliverables');
    expect(fixture.nativeElement.textContent).toContain('CONTENT REVIEW');
    workspace.submitDeliverable(job.id, 'Maya Chen', 'creator@sponsr.com', {
      type: 'url',
      url: 'https://youtube.com/watch?v=creator-work'
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Pending review');
    expect(fixture.nativeElement.querySelector('.submitted-deliverable a')?.getAttribute('href')).toBe('https://youtube.com/watch?v=creator-work');
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
        meta: '3 spots',
        jobId: 'job-goodfolk-morning'
      }]
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.opportunity-hero')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Northstar Labs');
    expect(fixture.nativeElement.textContent).toContain('$1,000–$3,000');
    expect(fixture.nativeElement.textContent).toContain('Spring launch video');
    expect(fixture.nativeElement.textContent).toContain('Interested creators');
    (fixture.nativeElement.querySelector('.dialog-reference-link') as HTMLButtonElement).click();
    const relatedJobDialog = dialogs.activeDialog();
    expect(relatedJobDialog?.kind).toBe('opportunity');
    if (relatedJobDialog?.kind !== 'opportunity') {
      throw new Error('Expected the related job opportunity dialog.');
    }
    expect(relatedJobDialog.opportunityType).toBe('Job');

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

  it('lets the owning company approve a pending deliverable from the job dialog', () => {
    const workspace = TestBed.inject(MarketplaceWorkspaceService);
    const job = workspace.jobs().find((candidate) => candidate.id === 'job-mint-home');
    if (!job) {
      throw new Error('Expected the Mint & Moss job mock.');
    }
    const originalSubmissions = job.deliverableSubmissions;
    job.deliverableSubmissions = [{
      id: 'deliverable-pending-review',
      creatorName: 'Maya Chen',
      creatorEmail: 'creator@sponsr.com',
      type: 'url',
      url: 'https://example.com/content',
      fileName: null,
      fileSize: null,
      submittedAt: new Date().toISOString(),
      status: 'Pending review'
    }];
    TestBed.inject(SessionService).signIn({
      type: 'company',
      name: 'Mint & Moss',
      email: 'company@sponsr.com'
    });
    const dialogs = TestBed.inject(DialogService);
    const fixture = TestBed.createComponent(DialogHostComponent);

    try {
      dialogs.openJob(job);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.opportunity-status')?.textContent).not.toContain('Accepted partnership');
      expect(fixture.nativeElement.textContent).not.toContain('Manage deliverables');
      expect(fixture.nativeElement.querySelector('.dialog-review-action')).toBeTruthy();
      (fixture.nativeElement.querySelector('.dialog-review-action') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(workspace.jobs().find((candidate) => candidate.id === job.id)?.deliverableSubmissions[0].status).toBe('Completed');
      expect(fixture.nativeElement.textContent).toContain('Completed');
      expect(dialogs.activeDialog()?.kind).toBe('opportunity');
    } finally {
      workspace.jobs.update((jobs) => jobs.map((candidate) =>
        candidate.id === job.id ? { ...candidate, deliverableSubmissions: originalSubmissions } : candidate
      ));
    }
  });

  it('requires confirmation before accepting or declining a proposal', () => {
    const dialogs = TestBed.inject(DialogService);
    const proposal = creatorProposals.find((candidate) => candidate.id === 'proposal-morrow-reset');
    if (!proposal) {
      throw new Error('Expected mock proposal.');
    }
    const originalStatus = proposal.status;
    const fixture = TestBed.createComponent(DialogHostComponent);

    dialogs.openProposal(proposal);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Deliverables');
    expect(fixture.nativeElement.textContent).toContain('Usage rights');
    expect(fixture.nativeElement.querySelector('.proposal-confirm-dialog')).toBeNull();

    (fixture.nativeElement.querySelector('.proposal-accept-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.proposal-detail-dialog')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.proposal-confirm-dialog')).toBeTruthy();
    expect(proposal.status).toBe(originalStatus);

    (fixture.nativeElement.querySelector('.proposal-confirm-dialog .dialog-primary') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(proposal.status).toBe('Accepted');
    expect(dialogs.activeDialog()).toBeNull();
    expect(dialogs.proposalConfirmation()).toBeNull();

    proposal.status = originalStatus;
    dialogs.openProposal(proposal);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.proposal-decline-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Decline this proposal?');
    (fixture.nativeElement.querySelector('.proposal-confirm-dialog .dialog-secondary') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(proposal.status).toBe(originalStatus);
    expect(fixture.nativeElement.querySelector('.proposal-detail-dialog')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.proposal-confirm-dialog')).toBeNull();

    dialogs.close();
    proposal.status = originalStatus;
  });
});
