import { Component, computed, inject } from '@angular/core';
import { type CampaignOpportunity, type JobOpportunity } from '../../core/job-marketplace-data';
import { DialogService } from '../../core/dialog.service';
import { mockCreatorAccounts } from '../../core/marketplace-mock-data';
import { MarketplaceWorkspaceService } from '../../core/marketplace-workspace.service';
import { SessionService } from '../../core/session.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  templateUrl: './jobs.html'
})
export class JobsComponent {
  private readonly session = inject(SessionService);
  private readonly dialogs = inject(DialogService);
  private readonly workspace = inject(MarketplaceWorkspaceService);
  protected readonly isCompany = this.session.currentUser()?.type === 'company';
  protected readonly campaigns = this.workspace.campaigns;
  protected readonly jobs = this.workspace.jobs;
  protected readonly companyCampaigns = computed(() =>
    this.campaigns().filter((campaign) => campaign.companyName === this.session.currentUser()?.name)
  );
  protected readonly companyJobs = computed(() =>
    this.jobs().filter((job) => job.companyName === this.session.currentUser()?.name)
  );
  protected readonly creatorAccounts = mockCreatorAccounts;
  protected readonly registeredJobIds = this.workspace.registeredJobIds;
  protected readonly registeredCampaignIds = this.workspace.registeredCampaignIds;

  protected readonly availableJobs = computed(() => this.jobs().filter((job) => this.hasInterestOpen(job)));

  protected isInterestedInJob(jobId: string): boolean {
    return this.registeredJobIds().includes(jobId);
  }

  protected isInterestedInCampaign(campaignId: string): boolean {
    return this.registeredCampaignIds().includes(campaignId);
  }

  protected toggleJobInterest(jobId: string): void {
    this.workspace.toggleJobInterest(jobId);
  }

  protected toggleCampaignInterest(campaignId: string): void {
    this.workspace.toggleCampaignInterest(campaignId);
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

  protected createJob(): void {
    this.dialogs.openCreateJob();
  }

  protected showCampaign(campaign: CampaignOpportunity): void {
    this.dialogs.openDetails(campaign.title, campaign.description, [
      { label: 'Creator capacity', value: `${this.getCampaignAssignedCount(campaign)} / ${campaign.creatorCapacity} assigned` },
      { label: 'Interested creators', value: `${this.getCampaignInterestCount(campaign)}` },
      { label: 'Related jobs', value: `${this.getCampaignJobCount(campaign.id)}` }
    ], 'CAMPAIGN DETAILS');
  }

  protected showCreator(creatorId: string): void {
    const creator = this.creatorAccounts.find((candidate) => candidate.id === creatorId);
    if (!creator) {
      return;
    }
    this.dialogs.openDetails(creator.name, creator.bio, [
      { label: 'Niche', value: creator.niche },
      { label: 'Audience', value: this.formatAudience(creator.audienceSize) },
      { label: 'Engagement', value: `${creator.engagementRate}%` },
      { label: 'Channels', value: creator.channels.join(', ') }
    ], 'CREATOR PROFILE');
  }

  protected showJob(job: JobOpportunity): void {
    this.dialogs.openDetails(job.title, job.description, [
      { label: 'Company', value: job.companyName },
      { label: 'Campaign', value: job.campaignTitle ?? 'Standalone job' },
      { label: 'Budget', value: this.formatBudget(job.budgetMin, job.budgetMax) },
      { label: 'Interest deadline', value: this.formatDate(job.interestDeadline) },
      { label: 'Delivery deadline', value: this.formatDate(job.deliveryDeadline) },
      { label: 'Creator capacity', value: `${job.assignedCreatorIds.length} / ${job.creatorCapacity} assigned` }
    ], 'JOB DETAILS');
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
    if (this.registeredCampaignIds().includes(campaign.id)) {
      campaignInterestIds.add('current-creator');
    }
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
