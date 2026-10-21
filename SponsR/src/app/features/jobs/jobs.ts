import { Component, computed, inject, signal } from '@angular/core';
import { campaignOpportunities, jobOpportunities, type CampaignOpportunity, type JobOpportunity } from '../../core/job-marketplace-data';
import { mockCreatorAccounts } from '../../core/marketplace-mock-data';
import { SessionService } from '../../core/session.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  templateUrl: './jobs.html'
})
export class JobsComponent {
  private readonly session = inject(SessionService);
  protected readonly isCompany = this.session.currentUser()?.type === 'company';
  protected readonly campaigns = signal<CampaignOpportunity[]>(campaignOpportunities);
  protected readonly jobs = signal<JobOpportunity[]>(jobOpportunities);
  protected readonly creatorAccounts = mockCreatorAccounts;
  protected readonly registeredJobIds = signal<string[]>([]);
  protected readonly registeredCampaignIds = signal<string[]>([]);

  protected readonly availableJobs = computed(() => this.jobs().filter((job) => this.hasInterestOpen(job)));

  protected isInterestedInJob(jobId: string): boolean {
    return this.registeredJobIds().includes(jobId);
  }

  protected isInterestedInCampaign(campaignId: string): boolean {
    return this.registeredCampaignIds().includes(campaignId);
  }

  protected toggleJobInterest(jobId: string): void {
    this.registeredJobIds.update((ids) =>
      ids.includes(jobId) ? ids.filter((id) => id !== jobId) : [...ids, jobId]
    );
  }

  protected toggleCampaignInterest(campaignId: string): void {
    this.registeredCampaignIds.update((ids) =>
      ids.includes(campaignId) ? ids.filter((id) => id !== campaignId) : [...ids, campaignId]
    );
  }

  protected toggleShortlist(jobId: string, creatorId: string): void {
    this.jobs.update((jobs) =>
      jobs.map((job) => {
        if (job.id !== jobId) {
          return job;
        }
        const shortlistedCreatorIds = job.shortlistedCreatorIds.includes(creatorId)
          ? job.shortlistedCreatorIds.filter((id) => id !== creatorId)
          : [...job.shortlistedCreatorIds, creatorId];
        return { ...job, shortlistedCreatorIds };
      })
    );
  }

  protected getInterestedCreators(job: JobOpportunity) {
    return this.creatorAccounts.filter((creator) => job.interestedCreatorIds.includes(creator.id));
  }

  protected isShortlisted(job: JobOpportunity, creatorId: string): boolean {
    return job.shortlistedCreatorIds.includes(creatorId);
  }

  protected getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('');
  }

  protected formatAudience(count: number): string {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(count);
  }

  protected getCampaignAssignedCount(campaign: CampaignOpportunity): number {
    const jobAssignedIds = this.jobs()
      .filter((job) => job.campaignId === campaign.id)
      .flatMap((job) => job.assignedCreatorIds);
    return new Set([...campaign.assignedCreatorIds, ...jobAssignedIds]).size;
  }

  protected getCampaignInterestCount(campaign: CampaignOpportunity): number {
    const campaignInterestIds = new Set(campaign.interestedCreatorIds);
    this.jobs()
      .filter((job) => job.campaignId === campaign.id)
      .forEach((job) => job.interestedCreatorIds.forEach((creatorId) => campaignInterestIds.add(creatorId)));
    return campaignInterestIds.size;
  }

  protected getCampaignJobCount(campaignId: string): number {
    return this.jobs().filter((job) => job.campaignId === campaignId).length;
  }

  protected isInterestOpen(job: JobOpportunity): boolean {
    return this.hasInterestOpen(job);
  }

  protected formatBudget(min: number, max: number): string {
    const formatter = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    return `${formatter.format(min)}–${formatter.format(max)}`;
  }

  protected formatDate(date: string): string {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
  }

  private hasInterestOpen(job: JobOpportunity): boolean {
    return new Date(`${job.interestDeadline}T23:59:59`).getTime() >= Date.now();
  }
}
