import { inject, Injectable, signal } from '@angular/core';
import type { CreatorProposal } from './creator-workspace-data';
import { creatorProposals } from './creator-workspace-data';
import type { JobOpportunity } from './job-marketplace-data';
import { mockMarketplaceCampaigns } from './marketplace-mock-data';
import { MarketplaceWorkspaceService } from './marketplace-workspace.service';
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
  | { kind: 'creator-job'; job: JobOpportunity; proposal: CreatorProposal }
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
    const relatedJobs = this.workspace.jobs().filter((job) =>
      job.campaignId === campaign.id
      || (job.campaignTitle === campaign.title && job.companyName === (campaign.companyName ?? campaign.brandName))
    );
    const campaignCompany = campaign.companyName ?? campaign.brandName;
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
    const viewerType = this.session.currentUser()?.type ?? null;
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
      canRegister: viewerType === 'creator' && (!capacity || assigned.size < capacity)
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
