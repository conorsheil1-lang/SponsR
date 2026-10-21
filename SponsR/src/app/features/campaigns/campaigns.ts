import { Component, computed, inject } from '@angular/core';
import { DialogService } from '../../core/dialog.service';
import { MarketplaceWorkspaceService } from '../../core/marketplace-workspace.service';
import { SessionService } from '../../core/session.service';
import type { CampaignOpportunity } from '../../core/job-marketplace-data';
import { creatorProposals } from '../../core/creator-workspace-data';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  template: `
    <section class="campaign-workspace-page">
      <header class="workspace-page-heading">
        <div>
          <p class="eyebrow">{{ isCompany ? 'COMPANY WORKSPACE' : 'CREATOR WORKSPACE' }}</p>
          <h2>Campaigns</h2>
          <p>{{ isCompany ? 'Organize related jobs and track creator interest.' : 'Campaigns linked to jobs with proposals you have accepted.' }}</p>
        </div>
        @if (isCompany) {
          <button class="page-count page-action" type="button" (click)="createCampaign()">Create campaign <span aria-hidden="true">＋</span></button>
        } @else {
          <span class="page-count">{{ campaigns().length }} accepted campaigns</span>
        }
      </header>

      <div class="campaign-opportunity-grid">
        @for (campaign of campaigns(); track campaign.id) {
          <article class="job-card campaign-opportunity-card">
            <div class="job-card-topline">
              <span class="job-category">Campaign</span>
              <span class="capacity-pill">{{ isCompany ? getAssignedCount(campaign) + ' / ' + campaign.creatorCapacity + ' creators' : 'Accepted partnership' }}</span>
            </div>
            <h4>{{ campaign.title }}</h4>
            <p class="job-description">{{ campaign.description }}</p>
            <div class="campaign-opportunity-meta">
              @if (isCompany) {
                <span>{{ getInterestCount(campaign) }} interested</span>
                <span>{{ getRelatedJobCount(campaign.id) }} related jobs</span>
              } @else {
                <span>{{ getAcceptedJobCount(campaign.id) }} accepted jobs</span>
              }
            </div>
            <div class="campaign-card-actions">
              <button type="button" class="job-detail-button" (click)="showDetails(campaign)">View campaign</button>
            </div>
          </article>
        } @empty {
          <p class="workspace-empty">
            {{ isCompany
              ? 'No campaigns yet. Create one to organize related jobs.'
              : 'No accepted campaign partnerships yet. Explore campaigns in Discover; accepted standalone jobs appear under Jobs.' }}
          </p>
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
  protected readonly acceptedCreatorJobs = computed(() =>
    creatorProposals
      .filter((proposal) => proposal.status === 'Accepted')
      .flatMap((proposal) => {
        const job = this.workspace.jobs().find((candidate) =>
          candidate.title === proposal.campaign && candidate.companyName === proposal.brand
        );
        return job ? [job] : [];
      })
  );
  protected readonly campaigns = computed(() => {
    if (this.isCompany) {
      return this.workspace.campaigns().filter((campaign) => campaign.companyName === this.session.currentUser()?.name);
    }
    const acceptedCampaignIds = new Set(
      this.acceptedCreatorJobs()
        .map((job) => job.campaignId)
        .filter((campaignId): campaignId is string => campaignId !== null)
    );
    return this.workspace.campaigns().filter((campaign) => acceptedCampaignIds.has(campaign.id));
  }  );
  protected readonly jobs = this.workspace.jobs;
  protected readonly interestCounts = computed(() => {
    return new Map(this.campaigns().map((campaign) => [
      campaign.id,
      new Set(campaign.interestedCreatorIds).size
    ]));
  });

  protected createCampaign(): void {
    this.dialogs.openCreateCampaign();
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

  protected getAcceptedJobCount(campaignId: string): number {
    return this.acceptedCreatorJobs().filter((job) => job.campaignId === campaignId).length;
  }

  protected showDetails(campaign: CampaignOpportunity): void {
    this.dialogs.openCampaign(campaign);
  }
}
