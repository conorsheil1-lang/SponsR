import { inject, Injectable, signal } from '@angular/core';
import type { CreatorProposal } from './creator-workspace-data';
import { creatorProposals } from './creator-workspace-data';
import type { JobOpportunity } from './job-marketplace-data';
import { mockCreatorAccounts, mockMarketplaceCampaigns } from './marketplace-mock-data';
import { MarketplaceWorkspaceService, type CompanyProposal } from './marketplace-workspace.service';
import { SessionService, type AccountType } from './session.service';

export interface DialogDetail {
  label: string;
  value: string;
}

export interface DialogListItem {
  title: string;
  subtitle: string;
  meta?: string;
  campaignId?: string;
  jobId?: string;
  creatorId?: string;
}

export interface OpportunityCreator {
  creatorId: string;
  creatorName: string;
  niche: string;
  audienceSize: number;
  engagementRate: number;
  interested: boolean;
  shortlisted: boolean;
  sourceType: 'Campaign' | 'Job';
  sourceId: string;
  sourceTitle: string;
}

export interface OpportunityDialogData {
  opportunityType: 'Campaign' | 'Job';
  opportunityId?: string;
  title: string;
  companyName: string;
  category: string;
  description: string;
  status: string;
  budget: string;
  metrics: DialogDetail[];
  relatedJobs: DialogListItem[];
  viewerType?: AccountType | null;
  isRegistered?: boolean;
  canRegister?: boolean;
  requiresContentReview?: boolean;
  deliverableStatus?: string;
  submissions?: JobOpportunity['deliverableSubmissions'];
  creatorCandidates?: OpportunityCreator[];
  canManageCreators?: boolean;
}

export interface CompanyProposalDraft {
  creatorId: string;
  creatorName: string;
  opportunityType: 'Campaign' | 'Job';
  opportunityId: string;
  opportunityTitle: string;
}

export interface CampaignDialogSource {
  id: string;
  title: string;
  category: string;
  description: string;
  companyName?: string;
  brandName?: string;
  creatorCapacity?: number;
  assignedCreatorIds?: string[];
  interestedCreatorIds?: string[];
  shortlistedCreatorIds?: string[];
  budgetMin?: number;
  budgetMax?: number;
  applicants?: number;
  status?: string;
}

export interface ProposalDecisionConfirmation {
  title: string;
  description: string;
  confirmLabel: string;
  decision: 'Accept' | 'Decline';
  onConfirm: () => void;
}

export type AppDialog =
  | { kind: 'details'; title: string; eyebrow: string; description: string; details: DialogDetail[] }
  | ({ kind: 'opportunity' } & OpportunityDialogData)
  | { kind: 'proposal'; proposal: CreatorProposal }
  | { kind: 'company-proposal'; proposal: CompanyProposal }
  | { kind: 'creator-job'; job: JobOpportunity; proposal: CreatorProposal }
  | { kind: 'compose-company-proposal'; draft: CompanyProposalDraft }
  | { kind: 'list'; title: string; eyebrow: string; description: string; items: DialogListItem[] }
  | { kind: 'create-job' }
  | { kind: 'create-campaign' };

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly workspace = inject(MarketplaceWorkspaceService);
  private readonly session = inject(SessionService);
  readonly activeDialog = signal<AppDialog | null>(null);
  readonly proposalConfirmation = signal<ProposalDecisionConfirmation | null>(null);
  readonly proposalStatusVersion = signal(0);

  openDetails(title: string, description: string, details: DialogDetail[], eyebrow = 'DETAILS'): void {
    this.activeDialog.set({ kind: 'details', title, description, details, eyebrow });
  }

  openOpportunity(opportunity: OpportunityDialogData): void {
    this.activeDialog.set({ kind: 'opportunity', ...opportunity });
  }

  openCampaign(campaign: CampaignDialogSource): void {
    const workspaceCampaign = this.workspace.campaigns().find((item) => item.id === campaign.id);
    const campaignCompany = campaign.companyName ?? campaign.brandName;
    const relatedJobs = this.workspace.jobs().filter((job) =>
      job.companyName === campaignCompany
      && (job.campaignId === campaign.id || job.campaignTitle === campaign.title)
    );
    const maxBudget = 'budgetMax' in campaign ? campaign.budgetMax : undefined;
    const minBudget = 'budgetMin' in campaign ? campaign.budgetMin : undefined;
    const capacity = campaign.creatorCapacity ?? workspaceCampaign?.creatorCapacity;
    const assigned = new Set([
      ...(campaign.assignedCreatorIds ?? workspaceCampaign?.assignedCreatorIds ?? []),
      ...relatedJobs.flatMap((job) => job.assignedCreatorIds)
    ]);
    const interested = new Set([
      ...(campaign.interestedCreatorIds ?? workspaceCampaign?.interestedCreatorIds ?? []),
      ...relatedJobs.flatMap((job) => job.interestedCreatorIds)
    ]);
    const campaignInterested = new Set(campaign.interestedCreatorIds ?? workspaceCampaign?.interestedCreatorIds ?? []);
    const viewerType = this.session.currentUser()?.type ?? null;
    const companyName = this.session.currentUser()?.name;
    const campaignShortlisted = campaign.shortlistedCreatorIds ?? workspaceCampaign?.shortlistedCreatorIds ?? [];
    const campaignCandidates = new Set([...campaignInterested, ...campaignShortlisted]);
    const candidateSources = [
      ...[...campaignCandidates].map((creatorId) => ({
        creatorId,
        sourceType: 'Campaign' as const,
        sourceId: campaign.id,
        sourceTitle: campaign.title,
        interested: campaignInterested.has(creatorId),
        shortlisted: campaignShortlisted.includes(creatorId)
      })),
      ...relatedJobs.flatMap((job) => [
        ...job.interestedCreatorIds.map((creatorId) => ({
          creatorId,
          sourceType: 'Job' as const,
          sourceId: job.id,
          sourceTitle: job.title,
          interested: true,
          shortlisted: job.shortlistedCreatorIds.includes(creatorId)
        })),
        ...job.shortlistedCreatorIds.filter((creatorId) => !job.interestedCreatorIds.includes(creatorId)).map((creatorId) => ({
          creatorId,
          sourceType: 'Job' as const,
          sourceId: job.id,
          sourceTitle: job.title,
          interested: false,
          shortlisted: true
        }))
      ])
    ];
    const creatorCandidates = candidateSources.flatMap((source) => {
      const creator = mockCreatorAccounts.find((candidate) => candidate.id === source.creatorId);
      return creator ? [{
        ...source,
        creatorName: creator.name,
        niche: creator.niche,
        audienceSize: creator.audienceSize,
        engagementRate: creator.engagementRate
      }] : [];
    });
    const metrics: DialogDetail[] = [
      { label: 'Category', value: campaign.category },
      { label: 'Interested creators', value: `${interested.size || ('applicants' in campaign ? campaign.applicants : 0) || 0}` },
      { label: 'Creator capacity', value: capacity ? `${assigned.size} / ${capacity} assigned` : 'Set per related job' },
      { label: 'Related jobs', value: `${relatedJobs.length}` }
    ];

    this.openOpportunity({
      opportunityType: 'Campaign',
      opportunityId: campaign.id,
      title: campaign.title,
      companyName: campaignCompany ?? 'Brand',
      category: campaign.category,
      description: campaign.description,
      status: ('status' in campaign && campaign.status) || (workspaceCampaign ? 'Active campaign' : 'Open'),
      budget: minBudget !== undefined && maxBudget !== undefined
        ? this.formatBudget(minBudget, maxBudget)
        : 'Set per related job',
      metrics,
      relatedJobs: relatedJobs.map((job) => ({
        title: job.title,
        subtitle: `${this.formatBudget(job.budgetMin, job.budgetMax)} · Interest closes ${this.formatDate(job.interestDeadline)}`,
        meta: `${Math.max(job.creatorCapacity - job.assignedCreatorIds.length, 0)} spots open`,
        jobId: job.id
      })),
      viewerType,
      isRegistered: this.workspace.isInterestedInCampaign(campaign.id),
      canRegister: viewerType === 'creator' && (!capacity || assigned.size < capacity),
      creatorCandidates,
      canManageCreators: viewerType === 'company' && campaignCompany === companyName
    });
  }

  openCampaignById(campaignId: string): void {
    const campaign = this.workspace.campaigns().find((item) => item.id === campaignId)
      ?? mockMarketplaceCampaigns.find((item) => item.id === campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} was not found.`);
    }
    this.openCampaign(campaign);
  }

  openJob(job: JobOpportunity, statusOverride?: string): void {
    const viewerType = this.session.currentUser()?.type ?? null;
    const currentJob = this.workspace.jobs().find((item) => item.id === job.id) ?? job;
    const deliverableStatus = currentJob.deliverableSubmissions
      .find((submission) => submission.creatorEmail === this.session.currentUser()?.email)?.status;
    const isOpen = new Date(`${currentJob.interestDeadline}T23:59:59`).getTime() >= Date.now()
      && currentJob.assignedCreatorIds.length < currentJob.creatorCapacity;
    const acceptedProposal = creatorProposals.find((proposal) =>
      viewerType === 'creator'
      && proposal.status === 'Accepted'
      && proposal.campaign === currentJob.title
      && proposal.brand === currentJob.companyName
    );
    const accepted = Boolean(acceptedProposal);
    const creatorCandidates = [...new Set([...currentJob.interestedCreatorIds, ...currentJob.shortlistedCreatorIds])]
      .flatMap((creatorId) => {
        const creator = mockCreatorAccounts.find((candidate) => candidate.id === creatorId);
        return creator ? [{
          creatorId,
          creatorName: creator.name,
          niche: creator.niche,
          audienceSize: creator.audienceSize,
          engagementRate: creator.engagementRate,
          interested: currentJob.interestedCreatorIds.includes(creatorId),
          shortlisted: currentJob.shortlistedCreatorIds.includes(creatorId),
          sourceType: 'Job' as const,
          sourceId: currentJob.id,
          sourceTitle: currentJob.title
        }] : [];
      });

    this.openOpportunity({
      opportunityType: 'Job',
      opportunityId: currentJob.id,
      title: currentJob.title,
      companyName: currentJob.companyName,
      category: currentJob.category,
      description: currentJob.description,
      status: accepted ? 'Accepted partnership' : statusOverride ?? (isOpen ? 'Accepting interest' : 'Interest closed'),
      budget: this.formatBudget(currentJob.budgetMin, currentJob.budgetMax),
      metrics: [
        { label: 'Campaign', value: currentJob.campaignTitle ?? 'Standalone job' },
        { label: 'Interest deadline', value: this.formatDate(currentJob.interestDeadline) },
        { label: 'Delivery deadline', value: this.formatDate(currentJob.deliveryDeadline) },
        { label: 'Creator spots', value: `${Math.max(currentJob.creatorCapacity - currentJob.assignedCreatorIds.length, 0)} of ${currentJob.creatorCapacity} open` },
        { label: 'Interested creators', value: `${currentJob.interestedCreatorIds.length}` },
        { label: 'Content review', value: currentJob.requiresContentReview ? 'Required before completion' : 'Not required' },
        ...(acceptedProposal ? [{ label: 'Agreed fee', value: acceptedProposal.amount }] : []),
        ...(deliverableStatus ? [{ label: 'Your deliverable', value: deliverableStatus }] : [])
      ],
      relatedJobs: [],
      viewerType,
      isRegistered: this.workspace.isInterestedInJob(currentJob.id),
      canRegister: viewerType === 'creator' && isOpen && !accepted,
      requiresContentReview: currentJob.requiresContentReview,
      submissions: currentJob.deliverableSubmissions,
      creatorCandidates,
      canManageCreators: viewerType === 'company' && currentJob.companyName === this.session.currentUser()?.name,
      ...(deliverableStatus ? { deliverableStatus } : {})
    });
  }

  openJobById(jobId: string): void {
    const job = this.workspace.jobs().find((item) => item.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} was not found.`);
    }
    this.openJob(job);
  }

  openCreatorProfile(creatorId: string, context: DialogDetail[] = []): void {
    const creator = mockCreatorAccounts.find((candidate) => candidate.id === creatorId);
    if (!creator) {
      throw new Error(`Creator ${creatorId} was not found.`);
    }
    const formatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
    this.openDetails(creator.name, creator.bio, [
      { label: 'Handle', value: creator.handle },
      { label: 'Niche', value: creator.niche },
      { label: 'Content tags', value: creator.contentTags.join(', ') },
      { label: 'Audience', value: formatter.format(creator.audienceSize) },
      { label: 'Engagement', value: `${creator.engagementRate}%` },
      { label: 'Typical rate', value: `$${creator.typicalRate.toLocaleString('en-US')}` },
      { label: 'Channels', value: creator.channels.join(', ') },
      ...context
    ], 'CREATOR PROFILE');
  }

  toggleOpportunityRegistration(): void {
    const dialog = this.activeDialog();
    if (dialog?.kind !== 'opportunity' || !dialog.canRegister || !dialog.opportunityId || dialog.viewerType !== 'creator') {
      return;
    }
    if (dialog.opportunityType === 'Campaign') {
      this.workspace.toggleCampaignInterest(dialog.opportunityId);
    } else {
      this.workspace.toggleJobInterest(dialog.opportunityId);
    }
    this.activeDialog.set({ ...dialog, isRegistered: !dialog.isRegistered });
  }

  toggleOpportunityShortlist(sourceType: 'Campaign' | 'Job', sourceId: string, creatorId: string): void {
    const dialog = this.activeDialog();
    const companyName = this.session.currentUser()?.name;
    if (dialog?.kind !== 'opportunity' || !dialog.canManageCreators || dialog.viewerType !== 'company' || !companyName) {
      throw new Error('Only the owning company can manage this creator shortlist.');
    }
    const source = sourceType === 'Job'
      ? this.workspace.jobs().find((job) => job.id === sourceId && job.companyName === companyName)
      : this.workspace.campaigns().find((campaign) => campaign.id === sourceId && campaign.companyName === companyName);
    if (!source) {
      throw new Error(`${sourceType} ${sourceId} does not belong to ${companyName}.`);
    }
    this.workspace.toggleCreatorShortlist(sourceType, sourceId, creatorId);
    if (dialog.opportunityType === 'Campaign' && dialog.opportunityId) {
      this.openCampaignById(dialog.opportunityId);
    } else if (dialog.opportunityType === 'Job' && dialog.opportunityId) {
      this.openJobById(dialog.opportunityId);
    }
  }

  openCompanyProposalComposer(candidate: OpportunityCreator): void {
    const dialog = this.activeDialog();
    const companyName = this.session.currentUser()?.name;
    if (dialog?.kind !== 'opportunity' || !dialog.canManageCreators || dialog.viewerType !== 'company' || !companyName) {
      throw new Error('Only the owning company can send a proposal from this opportunity.');
    }
    this.activeDialog.set({
      kind: 'compose-company-proposal',
      draft: {
        creatorId: candidate.creatorId,
        creatorName: candidate.creatorName,
        opportunityType: candidate.sourceType,
        opportunityId: candidate.sourceId,
        opportunityTitle: candidate.sourceTitle
      }
    });
  }

  openCompanyProposal(proposal: CompanyProposal): void {
    const user = this.session.currentUser();
    const isCompanyOwner = user?.type === 'company' && proposal.companyName === user.name;
    const isCreatorRecipient = user?.type === 'creator'
      && (user.accountId ? user.accountId === proposal.creatorId : user.name === proposal.creatorName);
    if (!isCompanyOwner && !isCreatorRecipient) {
      throw new Error('Only the sender or intended creator can view this proposal.');
    }
    this.activeDialog.set({ kind: 'company-proposal', proposal });
  }

  respondToCompanyProposal(proposalId: string, decision: 'Accepted' | 'Declined'): void {
    const user = this.session.currentUser();
    if (user?.type !== 'creator') {
      throw new Error('Only the intended creator can respond to this proposal.');
    }
    const creator = mockCreatorAccounts.find((candidate) =>
      user.accountId ? candidate.id === user.accountId : candidate.name === user.name
    );
    if (!creator) {
      throw new Error(`Creator profile for ${user.name} was not found.`);
    }
    this.workspace.respondToCompanyProposal(proposalId, creator.id, decision);
    const proposal = this.workspace.companyProposals().find((candidate) => candidate.id === proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} was not found after updating its response.`);
    }
    this.activeDialog.set({ kind: 'company-proposal', proposal });
  }

  openProposal(proposal: CreatorProposal): void {
    this.activeDialog.set({ kind: 'proposal', proposal });
    this.proposalConfirmation.set(null);
  }

  openCreatorJob(job: JobOpportunity, proposal: CreatorProposal): void {
    this.activeDialog.set({ kind: 'creator-job', job, proposal });
  }

  confirmProposalDecision(confirmation: ProposalDecisionConfirmation): void {
    this.proposalConfirmation.set(confirmation);
  }

  cancelProposalDecision(): void {
    this.proposalConfirmation.set(null);
  }

  applyProposalDecision(): void {
    const confirmation = this.proposalConfirmation();
    if (!confirmation) {
      return;
    }
    confirmation.onConfirm();
    this.proposalStatusVersion.update((version) => version + 1);
    this.proposalConfirmation.set(null);
    this.activeDialog.set(null);
  }

  openList(title: string, description: string, items: DialogListItem[], eyebrow = 'YOUR WORKSPACE'): void {
    this.activeDialog.set({ kind: 'list', title, description, items, eyebrow });
  }

  openCreateJob(): void {
    this.activeDialog.set({ kind: 'create-job' });
  }

  openCreateCampaign(): void {
    this.activeDialog.set({ kind: 'create-campaign' });
  }

  close(): void {
    this.proposalConfirmation.set(null);
    this.activeDialog.set(null);
  }

  private formatBudget(min: number, max: number): string {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    return `${formatter.format(min)}–${formatter.format(max)}`;
  }

  private formatDate(value: string): string {
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }
}
