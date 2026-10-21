import { inject, Injectable, signal } from '@angular/core';
import { mockCompanyAccounts, mockCreatorAccounts, mockMarketplaceCampaigns } from './marketplace-mock-data';
import type { CompanyAccount } from './marketplace-models';
import { campaignOpportunities, jobOpportunities, type CampaignOpportunity, type JobDeliverableSubmission, type JobOpportunity } from './job-marketplace-data';
import { SessionService } from './session.service';

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

export interface CompanyProposal {
  id: string;
  companyName: string;
  creatorId: string;
  creatorName: string;
  opportunityType: 'Campaign' | 'Job';
  opportunityId: string;
  opportunityTitle: string;
  amount: number;
  deliverables: string;
  platforms: string;
  timeline: string;
  usageRights: string;
  brief: string;
  sentAt: string;
  status: 'Sent' | 'Accepted' | 'Declined';
}

export interface NewCompanyProposalInput {
  creatorId: string;
  opportunityType: 'Campaign' | 'Job';
  opportunityId: string;
  amount: number;
  deliverables: string;
  platforms: string;
  timeline: string;
  usageRights: string;
  brief: string;
}

@Injectable({ providedIn: 'root' })
export class MarketplaceWorkspaceService {
  private readonly session = inject(SessionService);
  readonly campaigns = signal<CampaignOpportunity[]>(campaignOpportunities.map((campaign) => ({ ...campaign })));
  readonly jobs = signal<JobOpportunity[]>(jobOpportunities.map((job) => ({ ...job })));
  readonly registeredCampaignIds = signal<string[]>([]);
  readonly registeredJobIds = signal<string[]>([]);
  readonly registeredBrandIds = signal<string[]>([]);
  readonly companyProposals = signal<CompanyProposal[]>([]);

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
    const wasRegistered = this.isInterestedInCampaign(campaignId);
    this.registeredCampaignIds.update((ids) => wasRegistered
      ? ids.filter((id) => id !== campaignId)
      : [...ids, campaignId]
    );
    const creatorId = this.currentCreatorId();
    if (creatorId) {
      this.campaigns.update((campaigns) => campaigns.map((campaign) => {
        if (campaign.id !== campaignId) {
          return campaign;
        }
        const interestedCreatorIds = wasRegistered
          ? campaign.interestedCreatorIds.filter((id) => id !== creatorId)
          : campaign.interestedCreatorIds.includes(creatorId)
            ? campaign.interestedCreatorIds
            : [...campaign.interestedCreatorIds, creatorId];
        return { ...campaign, interestedCreatorIds };
      }));
    }
  }

  toggleJobInterest(jobId: string): void {
    const wasRegistered = this.isInterestedInJob(jobId);
    this.registeredJobIds.update((ids) => wasRegistered
      ? ids.filter((id) => id !== jobId)
      : [...ids, jobId]
    );
    const creatorId = this.currentCreatorId();
    if (creatorId) {
      this.jobs.update((jobs) => jobs.map((job) => {
        if (job.id !== jobId) {
          return job;
        }
        const interestedCreatorIds = wasRegistered
          ? job.interestedCreatorIds.filter((id) => id !== creatorId)
          : job.interestedCreatorIds.includes(creatorId)
            ? job.interestedCreatorIds
            : [...job.interestedCreatorIds, creatorId];
        return { ...job, interestedCreatorIds };
      }));
    }
  }

  toggleBrandInterest(brandId: string): void {
    this.registeredBrandIds.update((ids) =>
      ids.includes(brandId) ? ids.filter((id) => id !== brandId) : [...ids, brandId]
    );
  }

  toggleCreatorShortlist(opportunityType: 'Campaign' | 'Job', opportunityId: string, creatorId: string): void {
    if (opportunityType === 'Campaign') {
      this.campaigns.update((campaigns) => campaigns.map((campaign) =>
        campaign.id === opportunityId
          ? {
              ...campaign,
              shortlistedCreatorIds: campaign.shortlistedCreatorIds.includes(creatorId)
                ? campaign.shortlistedCreatorIds.filter((id) => id !== creatorId)
                : [...campaign.shortlistedCreatorIds, creatorId]
            }
          : campaign
      ));
      return;
    }
    this.jobs.update((jobs) => jobs.map((job) =>
      job.id === opportunityId
        ? {
            ...job,
            shortlistedCreatorIds: job.shortlistedCreatorIds.includes(creatorId)
              ? job.shortlistedCreatorIds.filter((id) => id !== creatorId)
              : [...job.shortlistedCreatorIds, creatorId]
          }
        : job
    ));
  }

  sendCompanyProposal(input: NewCompanyProposalInput, companyName: string): void {
    const creator = mockCreatorAccounts.find((candidate) => candidate.id === input.creatorId);
    if (!creator) {
      throw new Error(`Creator ${input.creatorId} was not found.`);
    }
    const opportunity = input.opportunityType === 'Job'
      ? this.jobs().find((job) => job.id === input.opportunityId && job.companyName === companyName)
      : this.campaigns().find((campaign) => campaign.id === input.opportunityId && campaign.companyName === companyName);
    if (!opportunity) {
      throw new Error(`${input.opportunityType} ${input.opportunityId} does not belong to ${companyName}.`);
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error('Proposal amount must be greater than zero.');
    }
    if ([input.deliverables, input.platforms, input.timeline, input.usageRights, input.brief].some((value) => !value.trim())) {
      throw new Error('Complete all proposal details before sending.');
    }
    const alreadySent = this.companyProposals().some((proposal) =>
      proposal.companyName === companyName
      && proposal.creatorId === creator.id
      && proposal.opportunityType === input.opportunityType
      && proposal.opportunityId === input.opportunityId
      && proposal.status === 'Sent'
    );
    if (alreadySent) {
      throw new Error(`A proposal has already been sent to ${creator.name} for ${opportunity.title}.`);
    }
    const proposal: CompanyProposal = {
      ...input,
      id: `company-proposal-${Date.now()}`,
      companyName,
      creatorName: creator.name,
      opportunityTitle: opportunity.title,
      sentAt: new Date().toISOString(),
      status: 'Sent'
    };
    this.companyProposals.update((proposals) => [proposal, ...proposals]);
  }

  respondToCompanyProposal(proposalId: string, creatorId: string, decision: 'Accepted' | 'Declined'): void {
    const proposal = this.companyProposals().find((candidate) => candidate.id === proposalId);
    if (!proposal || proposal.creatorId !== creatorId) {
      throw new Error(`Proposal ${proposalId} was not sent to creator ${creatorId}.`);
    }
    if (proposal.status !== 'Sent') {
      throw new Error(`Proposal ${proposalId} is no longer awaiting a response.`);
    }
    this.companyProposals.update((proposals) => proposals.map((candidate) =>
      candidate.id === proposalId ? { ...candidate, status: decision } : candidate
    ));
  }

  hasCompanyProposal(creatorId: string, opportunityType: 'Campaign' | 'Job', opportunityId: string, companyName: string): boolean {
    return this.companyProposals().some((proposal) =>
      proposal.companyName === companyName
      && proposal.creatorId === creatorId
      && proposal.opportunityType === opportunityType
      && proposal.opportunityId === opportunityId
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
      interestedCreatorIds: [],
      shortlistedCreatorIds: []
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

  private currentCreatorId(): string | undefined {
    const user = this.session.currentUser();
    if (user?.type !== 'creator') {
      return undefined;
    }
    return mockCreatorAccounts.find((creator) =>
      user.accountId ? creator.id === user.accountId : creator.name === user.name
    )?.id;
  }
}
