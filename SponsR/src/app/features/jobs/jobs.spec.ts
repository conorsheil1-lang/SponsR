import { TestBed } from '@angular/core/testing';
import { jobOpportunities } from '../../core/job-marketplace-data';
import { SessionService } from '../../core/session.service';
import { JobsComponent } from './jobs';

describe('JobsComponent', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('lets creators register interest in campaigns and open jobs', async () => {
    await TestBed.configureTestingModule({ imports: [JobsComponent] }).compileComponents();
    TestBed.inject(SessionService).signIn({
      type: 'creator',
      name: 'Maya Chen',
      email: 'creator@sponsr.com'
    });

    const fixture = TestBed.createComponent(JobsComponent);
    fixture.detectChanges();
    const campaignInterestButton = fixture.nativeElement.querySelector('.campaign-opportunity-card .job-interest-button') as HTMLButtonElement;
    const jobInterestButton = fixture.nativeElement.querySelector('.job-list .job-interest-button') as HTMLButtonElement;

    campaignInterestButton.click();
    jobInterestButton.click();
    fixture.detectChanges();

    expect(campaignInterestButton.textContent).toContain('Interest registered');
    expect(jobInterestButton.textContent).toContain('Interest registered');
  });

  it('keeps job interest open when all creator capacity is assigned', async () => {
    await TestBed.configureTestingModule({ imports: [JobsComponent] }).compileComponents();
    TestBed.inject(SessionService).signIn({
      type: 'creator',
      name: 'Maya Chen',
      email: 'creator@sponsr.com'
    });

    const job = jobOpportunities[0];
    const previousCapacity = job.creatorCapacity;
    job.creatorCapacity = job.assignedCreatorIds.length;

    try {
      const fixture = TestBed.createComponent(JobsComponent);
      fixture.detectChanges();
      const jobCard = fixture.nativeElement.querySelector('.job-list article') as HTMLElement;
      const assignedCapacity = jobCard.querySelector('.capacity-pill') as HTMLElement;
      const interestButton = jobCard.querySelector('.job-interest-button') as HTMLButtonElement;

      expect(assignedCapacity.textContent).toContain('1 / 1 creators assigned');
      expect(interestButton.disabled).toBe(false);
    } finally {
      job.creatorCapacity = previousCapacity;
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
    expect(fixture.nativeElement.textContent).toContain('Aria Morgan');

    shortlistButton.click();
    fixture.detectChanges();

    expect(shortlistButton.textContent).toContain('Shortlisted');
  });
});
