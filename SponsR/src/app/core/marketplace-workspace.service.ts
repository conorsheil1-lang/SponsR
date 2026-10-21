import { Injectable, signal } from '@angular/core';
import { mockMarketplaceCampaigns } from './marketplace-mock-data';
import { campaignOpportunities, jobOpportunities, type CampaignOpportunity, type JobOpportunity } from './job-marketplace-data';

export interface NewCampaignInput {
  companyName: string;
  title: string;
  category: string;
  description: string;
  creatorCapacity: number;
}

export interface NewJobInput {
  campaignId: string | null;
  companyName: string;
  title: string;
  category: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  interestDeadline: string;
  deliveryDeadline: string;
  creatorCapacity: number;
}

@Injectable({ providedIn: 'root' })
export class MarketplaceWorkspaceService {
  readonly campaigns = signal<CampaignOpportunity[]>(campaignOpportunities.map((campaign) => ({ ...campaign })));
  readonly jobs = signal<JobOpportunity[]>(jobOpportunities.map((job) => ({ ...job })));
  readonly registeredCampaignIds = signal<string[]>([]);
  readonly registeredJobIds = signal<string[]>([]);

  isInterestedInCampaign(campaignId: string): boolean {
    return this.registeredCampaignIds().includes(campaignId);
  }

  isInterestedInJob(jobId: string): boolean {
    return this.registeredJobIds().includes(jobId);
  }

  toggleCampaignInterest(campaignId: string): void {
    this.registeredCampaignIds.update((ids) =>
      ids.includes(campaignId) ? ids.filter((id) => id !== campaignId) : [...ids, campaignId]
    );
  }

  toggleJobInterest(jobId: string): void {
    this.registeredJobIds.update((ids) =>
      ids.includes(jobId) ? ids.filter((id) => id !== jobId) : [...ids, jobId]
    );
  }

  getRegisteredCampaigns(): Array<{ id: string; title: string; companyName: string; category: string }> {
    const registeredIds = new Set(this.registeredCampaignIds());
    return [
      ...mockMarketplaceCampaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        companyName: campaign.brandName,
        category: campaign.category
      })),
      ...this.campaigns().map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        companyName: campaign.companyName,
        category: campaign.category
      }))
    ].filter((campaign) => registeredIds.has(campaign.id));
  }

  getRegisteredJobs(): JobOpportunity[] {
    const registeredIds = new Set(this.registeredJobIds());
    return this.jobs().filter((job) => registeredIds.has(job.id));
  }

  addCampaign(input: NewCampaignInput): void {
    const campaign: CampaignOpportunity = {
      id: `campaign-${Date.now()}`,
      companyName: input.companyName,
      title: input.title,
      category: input.category,
      description: input.description,
      creatorCapacity: input.creatorCapacity,
      assignedCreatorIds: [],
      interestedCreatorIds: []
    };
    this.campaigns.update((campaigns) => [campaign, ...campaigns]);
  }

  addJob(input: NewJobInput): void {
    const campaign = input.campaignId
      ? this.campaigns().find((candidate) => candidate.id === input.campaignId)
      : undefined;
    const job: JobOpportunity = {
      id: `job-${Date.now()}`,
      campaignId: campaign?.id ?? null,
      campaignTitle: campaign?.title ?? null,
      companyName: input.companyName,
      title: input.title,
      category: input.category,
      description: input.description,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      interestDeadline: input.interestDeadline,
      deliveryDeadline: input.deliveryDeadline,
      creatorCapacity: input.creatorCapacity,
      assignedCreatorIds: [],
      interestedCreatorIds: [],
      shortlistedCreatorIds: []
    };
    this.jobs.update((jobs) => [job, ...jobs]);
  }
}
