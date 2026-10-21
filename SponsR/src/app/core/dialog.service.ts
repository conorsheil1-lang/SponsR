import { Injectable, signal } from '@angular/core';

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

export type AppDialog =
  | { kind: 'details'; title: string; eyebrow: string; description: string; details: DialogDetail[] }
  | ({ kind: 'opportunity' } & OpportunityDialogData)
  | { kind: 'list'; title: string; eyebrow: string; description: string; items: DialogListItem[] }
  | { kind: 'create-job' }
  | { kind: 'create-campaign' };

@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly activeDialog = signal<AppDialog | null>(null);

  openDetails(title: string, description: string, details: DialogDetail[], eyebrow = 'DETAILS'): void {
    this.activeDialog.set({ kind: 'details', title, description, details, eyebrow });
  }

  openOpportunity(opportunity: OpportunityDialogData): void {
    this.activeDialog.set({ kind: 'opportunity', ...opportunity });
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
    this.activeDialog.set(null);
  }
}
