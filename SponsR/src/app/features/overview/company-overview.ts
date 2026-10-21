import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DialogService, type DialogDetail, type DialogListItem } from '../../core/dialog.service';
import { mockCreatorAccounts } from '../../core/marketplace-mock-data';
import { MarketplaceWorkspaceService } from '../../core/marketplace-workspace.service';
import { SessionService } from '../../core/session.service';
import type { JobOpportunity } from '../../core/job-marketplace-data';

@Component({
  selector: 'app-company-overview',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="creator-dashboard company-dashboard">
      <header class="creator-welcome">
        <div>
          <p class="eyebrow">COMPANY WORKSPACE</p>
          <h2>Welcome back, {{ firstName() }}.</h2>
          <p>Keep your creator partnerships moving forward.</p>
        </div>
        <a routerLink="/discovery" class="dashboard-action">Find creators <span aria-hidden="true">↗</span></a>
      </header>

      <section class="creator-metrics" aria-label="Company account summary">
        <article class="creator-metric accent">
          <span>Campaigns</span>
          <strong>{{ campaigns().length }}</strong>
          <small>{{ activeJobs().length }} jobs accepting interest</small>
        </article>
        <article class="creator-metric">
          <span>Interested creators</span>
          <strong>{{ interestedCreatorCount() }}</strong>
          <small>Across your campaigns and jobs</small>
        </article>
        <article class="creator-metric">
          <span>Shortlisted</span>
          <strong>{{ shortlistedCreators().length }}</strong>
          <small>Ready for proposal review</small>
        </article>
        <article class="creator-metric">
          <span>Open proposals</span>
          <strong>{{ proposals.length }}</strong>
          <small>Awaiting your review</small>
        </article>
      </section>

      <div class="creator-dashboard-grid">
        <section class="dashboard-panel">
          <div class="dashboard-panel-heading">
            <div><p class="eyebrow">GOOD FITS</p><h3>Creators for you</h3></div>
            <button class="dashboard-view-action" type="button" (click)="showAllCreators()">View all</button>
          </div>
          <ul class="dashboard-list">
            @for (creator of recommendedCreators.slice(0, 3); track creator.id) {
              <li>
                <span class="company-creator-avatar">{{ getInitials(creator.name) }}</span>
                <div class="list-copy"><strong>{{ creator.name }}</strong><span>{{ creator.niche }} · {{ formatAudience(creator.audienceSize) }} audience</span></div>
                <button class="row-detail-action" type="button" (click)="showCreator(creator)">View</button>
              </li>
            }
          </ul>
        </section>

        <section class="dashboard-panel">
          <div class="dashboard-panel-heading">
            <div><p class="eyebrow">YOUR OPENINGS</p><h3>Active jobs</h3></div>
            <button class="dashboard-view-action" type="button" (click)="showAllJobs()">View all</button>
          </div>
          <ul class="dashboard-list">
            @for (job of activeJobs().slice(0, 3); track job.id) {
              <li>
                <span class="campaign-mark">{{ job.companyName.charAt(0) }}</span>
                <div class="list-copy"><strong>{{ job.title }}</strong><span>{{ job.companyName }} · {{ job.interestedCreatorIds.length }} interested</span></div>
                <button class="row-detail-action" type="button" (click)="showJob(job)">View</button>
              </li>
            } @empty {
              <li><div class="list-copy"><strong>No open jobs</strong><span>Create a job to start receiving creator interest.</span></div></li>
            }
          </ul>
        </section>

        <section class="dashboard-panel">
          <div class="dashboard-panel-heading">
            <div><p class="eyebrow">CREATOR INTEREST</p><h3>Interested creators</h3></div>
            <button class="dashboard-view-action" type="button" (click)="showAllInterestedCreators()">View all</button>
          </div>
          <ul class="dashboard-list">
            @for (creator of interestedCreators().slice(0, 3); track creator.id) {
              <li>
                <span class="company-creator-avatar">{{ getInitials(creator.name) }}</span>
                <div class="list-copy"><strong>{{ creator.name }}</strong><span>{{ creator.niche }} · {{ creator.interestedFor }}</span></div>
                <button class="row-detail-action" type="button" (click)="showCreator(creator)">View</button>
              </li>
            } @empty {
              <li><div class="list-copy"><strong>No creator interest yet</strong><span>Creators who register for your jobs will appear here.</span></div></li>
            }
          </ul>
        </section>

        <section class="dashboard-panel">
          <div class="dashboard-panel-heading">
            <div><p class="eyebrow">YOUR SHORTLIST</p><h3>Shortlisted creators</h3></div>
            <button class="dashboard-view-action" type="button" (click)="showAllShortlists()">View all</button>
          </div>
          <ul class="dashboard-list">
            @for (creator of shortlistedCreators().slice(0, 3); track creator.id) {
              <li>
                <span class="company-creator-avatar">{{ getInitials(creator.name) }}</span>
                <div class="list-copy"><strong>{{ creator.name }}</strong><span>{{ creator.shortlistedFor }}</span></div>
                <button class="row-detail-action" type="button" (click)="showCreator(creator)">View</button>
              </li>
            } @empty {
              <li><div class="list-copy"><strong>Your shortlist is empty</strong><span>Shortlist interested creators from Jobs.</span></div></li>
            }
          </ul>
        </section>

        <section class="dashboard-panel">
          <div class="dashboard-panel-heading">
            <div><p class="eyebrow">NEEDS YOUR ATTENTION</p><h3>Proposal activity</h3></div>
            <button class="dashboard-view-action" type="button" (click)="showAllProposals()">View all</button>
          </div>
          <ul class="dashboard-list">
            @for (proposal of proposals.slice(0, 3); track proposal.id) {
              <li>
                <div class="list-copy"><strong>{{ proposal.campaign }}</strong><span>{{ proposal.creator }} · {{ proposal.amount }}</span></div>
                <button class="row-detail-action" type="button" (click)="showProposal(proposal)">Review</button>
              </li>
            }
          </ul>
        </section>
      </div>
    </section>
  `
})
export class CompanyOverviewComponent {
  private readonly session = inject(SessionService);
  private readonly dialogs = inject(DialogService);
  private readonly workspace = inject(MarketplaceWorkspaceService);
  protected readonly campaigns = computed(() =>
    this.workspace.campaigns().filter((campaign) => campaign.companyName === this.session.currentUser()?.name)
  );
  protected readonly jobs = computed(() =>
    this.workspace.jobs().filter((job) => job.companyName === this.session.currentUser()?.name)
  );
  protected readonly proposals = [
    { id: 'company-proposal-theo', companyName: 'Northstar Labs', campaign: 'Tools for what’s next', creator: 'Theo Brooks', submitted: 'Today', status: 'Awaiting review', amount: '$4,700' },
    { id: 'company-proposal-marcus', companyName: 'Northstar Labs', campaign: 'Tools for what’s next', creator: 'Marcus Reed', submitted: 'Yesterday', status: 'Shortlisted', amount: '$4,200' }
  ].filter((proposal) => proposal.companyName === this.session.currentUser()?.name);
  protected readonly recommendedCreators = [...mockCreatorAccounts].sort((a, b) => b.engagementRate - a.engagementRate);
  protected readonly activeJobs = computed(() =>
    this.jobs().filter((job) => new Date(`${job.interestDeadline}T23:59:59`).getTime() >= Date.now())
  );
  protected readonly interestedCreatorCount = computed(() =>
    this.interestedCreators().length
  );
  protected readonly interestedCreators = computed(() => {
    const opportunitiesByCreator = new Map<string, string[]>();
    for (const campaign of this.campaigns()) {
      for (const creatorId of campaign.interestedCreatorIds) {
        const titles = opportunitiesByCreator.get(creatorId) ?? [];
        titles.push(campaign.title);
        opportunitiesByCreator.set(creatorId, titles);
      }
    }
    for (const job of this.jobs()) {
      for (const creatorId of job.interestedCreatorIds) {
        const titles = opportunitiesByCreator.get(creatorId) ?? [];
        titles.push(job.title);
        opportunitiesByCreator.set(creatorId, titles);
      }
    }
    return mockCreatorAccounts
      .filter((creator) => opportunitiesByCreator.has(creator.id))
      .map((creator) => ({
        ...creator,
        interestedFor: (opportunitiesByCreator.get(creator.id) ?? []).join(', ')
      }));
  });
  protected readonly shortlistedCreators = computed(() => {
    const opportunitiesByCreator = new Map<string, string[]>();
    for (const campaign of this.campaigns()) {
      for (const creatorId of campaign.shortlistedCreatorIds) {
        const titles = opportunitiesByCreator.get(creatorId) ?? [];
        titles.push(campaign.title);
        opportunitiesByCreator.set(creatorId, titles);
      }
    }
    for (const job of this.jobs()) {
      for (const creatorId of job.shortlistedCreatorIds) {
        const titles = opportunitiesByCreator.get(creatorId) ?? [];
        titles.push(job.title);
        opportunitiesByCreator.set(creatorId, titles);
      }
    }
    return mockCreatorAccounts
      .filter((creator) => opportunitiesByCreator.has(creator.id))
      .map((creator) => ({
        ...creator,
        shortlistedFor: (opportunitiesByCreator.get(creator.id) ?? []).join(', ')
      }));
  });

  protected firstName(): string {
    return this.session.currentUser()?.name.split(' ')[0] ?? 'there';
  }

  protected getInitials(name: string): string {
    return name.split(' ').map((part) => part.charAt(0)).join('');
  }

  protected formatAudience(count: number): string {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(count);
  }

  protected showAllCreators(): void {
    this.dialogs.openList(
      'Creators for you',
      'A curated starting point for your next partnership.',
      this.recommendedCreators.map((creator) => ({
        title: creator.name,
        subtitle: `${creator.niche} · ${this.formatAudience(creator.audienceSize)} audience`,
        meta: `${creator.engagementRate}% engagement`,
        creatorId: creator.id
      }))
    );
  }

  protected showAllInterestedCreators(): void {
    this.dialogs.openList(
      'Interested creators',
      'Creators who registered interest in one or more of your jobs.',
      this.interestedCreators().map((creator) => ({
        title: creator.name,
        subtitle: `${creator.niche} · Interested in ${creator.interestedFor}`,
        meta: `${this.formatAudience(creator.audienceSize)} audience · ${creator.engagementRate}% engagement`,
        creatorId: creator.id
      })),
      'CREATOR INTEREST'
    );
  }

  protected showAllJobs(): void {
    this.dialogs.openList(
      'Active jobs',
      'Jobs currently accepting creator interest.',
      this.activeJobs().map((job) => ({
        title: job.title,
        subtitle: `${job.companyName} · Interest by ${job.interestDeadline}`,
        meta: `${job.interestedCreatorIds.length} interested`,
        jobId: job.id
      })),
      'YOUR OPENINGS'
    );
  }

  protected showAllShortlists(): void {
    const items: DialogListItem[] = this.shortlistedCreators().map((creator) => ({
      title: creator.name,
      subtitle: `${creator.niche} · ${creator.shortlistedFor}`,
      meta: `${this.formatAudience(creator.audienceSize)} audience · ${creator.engagementRate}% engagement`,
      creatorId: creator.id
    }));
    this.dialogs.openList('Shortlisted creators', 'Creators your team has shortlisted for job proposals.', items, 'YOUR SHORTLIST');
  }

  protected showAllProposals(): void {
    this.dialogs.openList(
      'Proposal activity',
      'Review proposals currently awaiting a decision.',
      this.proposals.map((proposal) => ({
        title: proposal.campaign,
        subtitle: `${proposal.creator} · ${proposal.status}`,
        meta: proposal.amount
      })),
      'NEEDS YOUR ATTENTION'
    );
  }

  protected showCreator(creator: (typeof mockCreatorAccounts)[number] & { shortlistedFor?: string }): void {
    const context: DialogDetail[] = [];
    if ('shortlistedFor' in creator && typeof creator.shortlistedFor === 'string' && creator.shortlistedFor) {
      context.push({ label: 'Shortlisted for', value: creator.shortlistedFor });
    }
    if ('interestedFor' in creator && typeof creator.interestedFor === 'string' && creator.interestedFor) {
      context.push({ label: 'Registered interest', value: creator.interestedFor });
    }
    this.dialogs.openCreatorProfile(creator.id, context);
  }

  protected showJob(job: JobOpportunity): void {
    this.dialogs.openJob(job);
  }

  protected showProposal(proposal: (typeof this.proposals)[number]): void {
    this.dialogs.openDetails(proposal.campaign, 'Proposal submitted by a creator for your review.', [
      { label: 'Company', value: proposal.companyName },
      { label: 'Creator', value: proposal.creator },
      { label: 'Status', value: proposal.status },
      { label: 'Proposed amount', value: proposal.amount },
      { label: 'Submitted', value: proposal.submitted }
    ], 'PROPOSAL');
  }
}
