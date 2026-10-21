import { TestBed } from '@angular/core/testing';
import { creatorProposals } from '../../core/creator-workspace-data';
import { DialogService } from '../../core/dialog.service';
import { MarketplaceWorkspaceService } from '../../core/marketplace-workspace.service';
import { SessionService } from '../../core/session.service';
import { JobsComponent } from './jobs';

describe('JobsComponent', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows creators only jobs with accepted proposals', async () => {
    await TestBed.configureTestingModule({ imports: [JobsComponent] }).compileComponents();
    TestBed.inject(SessionService).signIn({
      type: 'creator',
      name: 'Maya Chen',
      email: 'creator@sponsr.com'
    });

    const fixture = TestBed.createComponent(JobsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Accepted jobs');
    expect(fixture.nativeElement.textContent).toContain('A home that feels like you');
    expect(fixture.nativeElement.querySelectorAll('.accepted-job-card').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.creator-campaigns-section')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Make room for a reset');
    expect(fixture.nativeElement.querySelector('.accepted-job-card')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.accepted-job-view-button')?.textContent).toContain('View job');
    expect(fixture.nativeElement.querySelector('.accepted-job-action')?.textContent).toContain('Manage deliverables');
  });

  it('opens job details separately from deliverable management', async () => {
    await TestBed.configureTestingModule({ imports: [JobsComponent] }).compileComponents();
    TestBed.inject(SessionService).signIn({
      type: 'creator',
      name: 'Maya Chen',
      email: 'creator@sponsr.com'
    });
    const fixture = TestBed.createComponent(JobsComponent);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.accepted-job-view-button') as HTMLButtonElement).click();
    expect(TestBed.inject(DialogService).activeDialog()?.kind).toBe('details');
    TestBed.inject(DialogService).close();

    (fixture.nativeElement.querySelector('.accepted-job-action') as HTMLButtonElement).click();
    expect(TestBed.inject(DialogService).activeDialog()?.kind).toBe('creator-job');
  });

  it('links accepted jobs to their parent campaign when present', async () => {
    await TestBed.configureTestingModule({ imports: [JobsComponent] }).compileComponents();
    TestBed.inject(SessionService).signIn({
      type: 'creator',
      name: 'Maya Chen',
      email: 'creator@sponsr.com'
    });
    const workspace = TestBed.inject(MarketplaceWorkspaceService);
    const job = workspace.jobs().find((candidate) => candidate.id === 'job-mint-home');
    if (!job) {
      throw new Error('Expected the accepted Mint & Moss job mock.');
    }
    const originalCampaignId = job.campaignId;
    const originalCampaignTitle = job.campaignTitle;
    job.campaignId = 'campaign-slower-mornings';
    job.campaignTitle = 'The slower mornings series';

    try {
      const fixture = TestBed.createComponent(JobsComponent);
      fixture.detectChanges();
      const campaignLink = fixture.nativeElement.querySelector('.campaign-parent-link') as HTMLButtonElement;
      expect(campaignLink.textContent).toContain('The slower mornings series');
      campaignLink.click();
      expect(TestBed.inject(DialogService).activeDialog()?.kind).toBe('details');
    } finally {
      job.campaignId = originalCampaignId;
      job.campaignTitle = originalCampaignTitle;
    }
  });

  it('shows an empty state when the creator has no accepted proposals', async () => {
    await TestBed.configureTestingModule({ imports: [JobsComponent] }).compileComponents();
    TestBed.inject(SessionService).signIn({
      type: 'creator',
      name: 'Maya Chen',
      email: 'creator@sponsr.com'
    });

    const acceptedProposal = creatorProposals.find((proposal) => proposal.status === 'Accepted');
    if (!acceptedProposal) {
      throw new Error('Expected mock accepted proposal.');
    }
    const previousStatus = acceptedProposal.status;
    acceptedProposal.status = 'In review';

    try {
      const fixture = TestBed.createComponent(JobsComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('No accepted jobs yet');
      expect(fixture.nativeElement.querySelector('.accepted-job-card')).toBeNull();
    } finally {
      acceptedProposal.status = previousStatus;
    }
  });

  it('lets companies review interested creators and manage the shortlist', async () => {
    await TestBed.configureTestingModule({ imports: [JobsComponent] }).compileComponents();
    TestBed.inject(SessionService).signIn({
      type: 'company',
      name: 'Northstar Labs',
      email: 'company@sponsr.com'
    });

    const fixture = TestBed.createComponent(JobsComponent);
    fixture.detectChanges();
    const shortlistButton = fixture.nativeElement.querySelector('.interested-creator-row .shortlist-button') as HTMLButtonElement;

    expect(fixture.nativeElement.textContent).toContain('Interested creators');
    expect(fixture.nativeElement.textContent).toContain('Marcus Reed');
    expect(fixture.nativeElement.textContent).toContain('Theo Brooks');

    shortlistButton.click();
    fixture.detectChanges();

    expect(shortlistButton.textContent).toContain('Shortlisted');
  });

  it('lets a company approve a submitted draft and complete the job', async () => {
    await TestBed.configureTestingModule({ imports: [JobsComponent] }).compileComponents();
    const session = TestBed.inject(SessionService);
    const workspace = TestBed.inject(MarketplaceWorkspaceService);
    session.signIn({
      type: 'company',
      name: 'Mint & Moss',
      email: 'company@sponsr.com'
    });
    const job = workspace.jobs().find((candidate) => candidate.id === 'job-mint-home');
    if (!job) {
      throw new Error('Expected the Mint & Moss job mock.');
    }
    workspace.submitDeliverable(job.id, 'Maya Chen', 'creator@sponsr.com', {
      type: 'url',
      url: 'https://instagram.com/p/example'
    });

    const fixture = TestBed.createComponent(JobsComponent);
    fixture.detectChanges();
    const approveButton = fixture.nativeElement.querySelector('.job-submission-row .shortlist-button') as HTMLButtonElement;
    expect(fixture.nativeElement.textContent).toContain('Pending review');
    approveButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Completed');
    expect(fixture.nativeElement.querySelector('.job-submission-row .shortlist-button')).toBeNull();
  });
});
