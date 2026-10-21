import { Component, computed, inject } from '@angular/core';
import { DialogService } from '../../core/dialog.service';
import { MarketplaceWorkspaceService } from '../../core/marketplace-workspace.service';
import { SessionService } from '../../core/session.service';
import type { CampaignOpportunity } from '../../core/job-marketplace-data';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  template: `
    <section class="campaign-workspace-page">
      <header class="workspace-page-heading">
        <div>
          <p class="eyebrow">{{ isCompany ? 'COMPANY WORKSPACE' : 'CREATOR WORKSPACE' }}</p>
          <h2>{{ isCompany ? 'Campaigns' : 'Explore campaigns' }}</h2>
          <p>{{ isCompany ? 'Organize related jobs and track creator interest.' : 'Discover broader partnership opportunities and register interest.' }}</p>
        </div>
        @if (isCompany) {
          <button class="page-count page-action" type="button" (click)="createCampaign()">Create campaign <span aria-hidden="true">＋</span></button>
        } @else {
          <span class="page-count">{{ campaigns().length }} campaigns</span>
        }
      </header>

      <div class="campaign-opportunity-grid">
        @for (campaign of campaigns(); track campaign.id) {
          <article class="job-card campaign-opportunity-card">
            <div class="job-card-topline">
              <span class="job-category">Campaign</span>
              <span class="capacity-pill">{{ getAssignedCount(campaign) }} / {{ campaign.creatorCapacity }} creators</span>
            </div>
            <h4>{{ campaign.title }}</h4>
            <p class="job-description">{{ campaign.description }}</p>
            <div class="campaign-opportunity-meta">
              <span>{{ getInterestCount(campaign) }} interested</span>
              <span>{{ getRelatedJobCount(campaign.id) }} related jobs</span>
            </div>
            <div class="campaign-card-actions">
              <button type="button" class="job-detail-button" (click)="showDetails(campaign)">View campaign</button>
              @if (!isCompany) {
                <button
                  type="button"
                  class="job-interest-button"
                  [class.registered]="isRegistered(campaign.id)"
                  (click)="toggleInterest(campaign.id)"
                >
                  {{ isRegistered(campaign.id) ? 'Interest registered ✓' : 'Register interest' }}
                </button>
              }
            </div>
          </article>
        } @empty {
          <p class="workspace-empty">No campaigns yet.</p>
        }
      </div>
    </section>
  `
})
export class CampaignsComponent {
  private readonly session = inject(SessionService);
  private readonly dialogs = inject(DialogService);
  private readonly workspace = inject(MarketplaceWorkspaceService);
  protected readonly isCompany = this.session.currentUser()?.type === 'company';
  protected readonly campaigns = computed(() => this.isCompany
    ? this.workspace.campaigns().filter((campaign) => campaign.companyName === this.session.currentUser()?.name)
    : this.workspace.campaigns()
  );
  protected readonly jobs = this.workspace.jobs;
  private readonly registeredCampaignIds = this.workspace.registeredCampaignIds;
  protected readonly interestCounts = computed(() => {
    const registered = this.registeredCampaignIds();
    return new Map(this.campaigns().map((campaign) => [
      campaign.id,
      new Set([...campaign.interestedCreatorIds, ...(registered.includes(campaign.id) ? ['current-creator'] : [])]).size
    ]));
  });

  protected createCampaign(): void {
    this.dialogs.openCreateCampaign();
  }

  protected isRegistered(campaignId: string): boolean {
    return this.registeredCampaignIds().includes(campaignId);
  }

  protected toggleInterest(campaignId: string): void {
    this.workspace.toggleCampaignInterest(campaignId);
  }

  protected getAssignedCount(campaign: CampaignOpportunity): number {
    const assignedFromJobs = this.jobs()
      .filter((job) => job.campaignId === campaign.id)
      .flatMap((job) => job.assignedCreatorIds);
    return new Set([...campaign.assignedCreatorIds, ...assignedFromJobs]).size;
  }

  protected getInterestCount(campaign: CampaignOpportunity): number {
    return this.interestCounts().get(campaign.id) ?? campaign.interestedCreatorIds.length;
  }

  protected getRelatedJobCount(campaignId: string): number {
    return this.jobs().filter((job) => job.campaignId === campaignId).length;
  }

  protected showDetails(campaign: CampaignOpportunity): void {
    const relatedJobs = this.jobs().filter((job) => job.campaignId === campaign.id);
    this.dialogs.openDetails(campaign.title, campaign.description, [
      { label: 'Capacity', value: `${this.getAssignedCount(campaign)} / ${campaign.creatorCapacity} assigned` },
      { label: 'Creator interest', value: `${this.getInterestCount(campaign)} creators` },
      { label: 'Related jobs', value: relatedJobs.map((job) => job.title).join(', ') || 'No jobs yet' }
    ], 'CAMPAIGN DETAILS');
  }
}
