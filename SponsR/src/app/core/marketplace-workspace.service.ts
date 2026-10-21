import { Injectable, signal } from '@angular/core';
import { mockCompanyAccounts, mockMarketplaceCampaigns } from './marketplace-mock-data';
import type { CompanyAccount } from './marketplace-models';
import { campaignOpportunities, jobOpportunities, type CampaignOpportunity, type JobDeliverableSubmission, type JobOpportunity } from './job-marketplace-data';

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
  requiresContentReview: boolean;
}

@Injectable({ providedIn: 'root' })
export class MarketplaceWorkspaceService {
  readonly campaigns = signal<CampaignOpportunity[]>(campaignOpportunities.map((campaign) => ({ ...campaign })));
  readonly jobs = signal<JobOpportunity[]>(jobOpportunities.map((job) => ({ ...job })));
  readonly registeredCampaignIds = signal<string[]>([]);
  readonly registeredJobIds = signal<string[]>([]);
  readonly registeredBrandIds = signal<string[]>([]);

  isInterestedInCampaign(campaignId: string): boolean {
    return this.registeredCampaignIds().includes(campaignId);
  }

  isInterestedInJob(jobId: string): boolean {
    return this.registeredJobIds().includes(jobId);
  }

  isInterestedInBrand(brandId: string): boolean {
    return this.registeredBrandIds().includes(brandId);
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

  toggleBrandInterest(brandId: string): void {
    this.registeredBrandIds.update((ids) =>
      ids.includes(brandId) ? ids.filter((id) => id !== brandId) : [...ids, brandId]
    );
  }

  getRegisteredBrands(): CompanyAccount[] {
    const registeredIds = new Set(this.registeredBrandIds());
    return mockCompanyAccounts.filter((brand) => registeredIds.has(brand.id));
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
      requiresContentReview: input.requiresContentReview,
      assignedCreatorIds: [],
      interestedCreatorIds: [],
      shortlistedCreatorIds: [],
      deliverableSubmissions: []
    };
    this.jobs.update((jobs) => [job, ...jobs]);
  }

  submitDeliverable(
    jobId: string,
    creatorName: string,
    creatorEmail: string,
    attachment: { type: 'url'; url: string } | { type: 'file'; file: File }
  ): void {
    const job = this.jobs().find((candidate) => candidate.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} was not found.`);
    }
    if (job.deliverableSubmissions.some((submission) => submission.creatorEmail === creatorEmail)) {
      throw new Error(`A deliverable has already been submitted for job ${jobId}.`);
    }
    if (attachment.type === 'url') {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(attachment.url);
      } catch {
        throw new Error('Deliverable links must be valid URLs.');
      }
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        throw new Error('Deliverable links must use HTTP or HTTPS.');
      }
    }
    if (attachment.type === 'file' && attachment.file.size === 0) {
      throw new Error('The uploaded deliverable file is empty.');
    }

    const file = attachment.type === 'file' ? attachment.file : null;
    const url = attachment.type === 'url' ? attachment.url : URL.createObjectURL(attachment.file);
    const submission: JobDeliverableSubmission = {
      id: `deliverable-${Date.now()}`,
      creatorName,
      creatorEmail,
      type: attachment.type,
      url,
      fileName: file?.name ?? null,
      fileSize: file?.size ?? null,
      submittedAt: new Date().toISOString(),
      status: job.requiresContentReview ? 'Pending review' : 'Completed'
    };
    this.jobs.update((jobs) => jobs.map((candidate) =>
      candidate.id === jobId
        ? { ...candidate, deliverableSubmissions: [...candidate.deliverableSubmissions, submission] }
        : candidate
    ));
  }

  approveDeliverable(jobId: string, submissionId: string, companyName: string): void {
    const job = this.jobs().find((candidate) => candidate.id === jobId);
    if (!job || job.companyName !== companyName) {
      throw new Error(`Job ${jobId} does not belong to ${companyName}.`);
    }
    const submission = job.deliverableSubmissions.find((candidate) => candidate.id === submissionId);
    if (!submission) {
      throw new Error(`Deliverable ${submissionId} was not found.`);
    }
    if (!job.requiresContentReview || submission.status !== 'Pending review') {
      throw new Error(`Deliverable ${submissionId} is not awaiting content review.`);
    }
    this.jobs.update((jobs) => jobs.map((candidate) =>
      candidate.id === jobId
        ? {
            ...candidate,
            deliverableSubmissions: candidate.deliverableSubmissions.map((submission) =>
              submission.id === submissionId ? { ...submission, status: 'Completed' } : submission
            )
          }
        : candidate
    ));
  }
}
