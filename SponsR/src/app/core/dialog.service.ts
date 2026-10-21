import { Injectable, signal } from '@angular/core';
import type { CreatorProposal } from './creator-workspace-data';

export interface DialogDetail {
  label: string;
  value: string;
}

export interface DialogListItem {
  title: string;
  subtitle: string;
  meta?: string;
}

export interface OpportunityDialogData {
  opportunityType: 'Campaign' | 'Job';
  title: string;
  companyName: string;
  category: string;
  description: string;
  status: string;
  budget: string;
  metrics: DialogDetail[];
  relatedJobs: DialogListItem[];
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
  | { kind: 'list'; title: string; eyebrow: string; description: string; items: DialogListItem[] }
  | { kind: 'create-job' }
  | { kind: 'create-campaign' };

@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly activeDialog = signal<AppDialog | null>(null);
  readonly proposalConfirmation = signal<ProposalDecisionConfirmation | null>(null);
  readonly proposalStatusVersion = signal(0);

  openDetails(title: string, description: string, details: DialogDetail[], eyebrow = 'DETAILS'): void {
    this.activeDialog.set({ kind: 'details', title, description, details, eyebrow });
  }

  openOpportunity(opportunity: OpportunityDialogData): void {
    this.activeDialog.set({ kind: 'opportunity', ...opportunity });
  }

  openProposal(proposal: CreatorProposal): void {
    this.activeDialog.set({ kind: 'proposal', proposal });
    this.proposalConfirmation.set(null);
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
}
