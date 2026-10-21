import { TestBed } from '@angular/core/testing';
import { creatorProposals } from '../../core/creator-workspace-data';
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
    expect(fixture.nativeElement.textContent).not.toContain('Make room for a reset');
    expect(fixture.nativeElement.textContent).not.toContain('Register interest');
    expect(fixture.nativeElement.querySelector('.accepted-job-card')).toBeTruthy();
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
});
