import { Component, computed, effect, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogService, type AppDialog, type CompanyProposalDraft, type OpportunityCreator, type OpportunityDialogData } from '../core/dialog.service';
import { creatorProposals, type CreatorProposal } from '../core/creator-workspace-data';
import type { JobOpportunity } from '../core/job-marketplace-data';
import { MarketplaceWorkspaceService, type CompanyProposal } from '../core/marketplace-workspace.service';
import { SessionService } from '../core/session.service';

@Component({
  selector: 'app-dialog-host',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (dialogs.activeDialog(); as dialog) {
      <div class="dialog-backdrop" (click)="dialogs.close()">
        <section
          class="app-dialog"
          [class.opportunity-dialog]="dialog.kind === 'opportunity'"
          [class.proposal-detail-dialog]="dialog.kind === 'proposal' || dialog.kind === 'company-proposal'"
          [class.creator-job-dialog]="dialog.kind === 'creator-job'"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="dialogAriaLabel(dialog)"
          (click)="$event.stopPropagation()"
        >
          <button class="dialog-close" type="button" aria-label="Close dialog" (click)="dialogs.close()">×</button>

          @if (dialog.kind === 'details') {
            <p class="eyebrow">{{ dialog.eyebrow }}</p>
            <h2>{{ dialog.title }}</h2>
            <p class="dialog-description">{{ dialog.description }}</p>
            <dl class="dialog-details">
              @for (detail of dialog.details; track detail.label) {
                <div><dt>{{ detail.label }}</dt><dd>{{ detail.value }}</dd></div>
              }
            </dl>
          } @else if (dialog.kind === 'proposal') {
            <div class="proposal-dialog-hero">
              <p class="eyebrow">PROPOSAL DETAILS</p>
              <div class="proposal-dialog-heading">
                <div>
                  <span class="proposal-brand-label">{{ dialog.proposal.brand }}</span>
                  <h2>{{ dialog.proposal.campaign }}</h2>
                </div>
                <span class="proposal-dialog-status" [class]="dialog.proposal.status.toLowerCase().replace(' ', '-')">
                  {{ dialog.proposal.status }}
                </span>
              </div>
              <p class="proposal-dialog-submitted">Submitted {{ dialog.proposal.submitted }}</p>
              <div class="proposal-offer">
                <span>PROPOSED PAYMENT</span>
                <strong>{{ dialog.proposal.amount }}</strong>
              </div>
            </div>
            <section class="proposal-dialog-section">
              <h3>What’s included</h3>
              <dl class="proposal-dialog-details">
                <div><dt>Deliverables</dt><dd>{{ dialog.proposal.deliverables }}</dd></div>
                <div><dt>Platforms</dt><dd>{{ dialog.proposal.platform }}</dd></div>
                <div><dt>Timeline</dt><dd>{{ dialog.proposal.timeline }}</dd></div>
                <div><dt>Usage rights</dt><dd>{{ dialog.proposal.usageRights }}</dd></div>
              </dl>
            </section>
            <section class="proposal-dialog-brief">
              <h3>Brief from {{ dialog.proposal.brand }}</h3>
              <p>{{ dialog.proposal.brief }}</p>
            </section>
            @if (dialog.proposal.status !== 'Accepted' && dialog.proposal.status !== 'Declined') {
              <div class="proposal-dialog-actions">
                <button type="button" class="proposal-decline-button"
                  (click)="requestProposalDecision(dialog.proposal, 'Decline')">Decline</button>
                <button type="button" class="proposal-accept-button"
                  (click)="requestProposalDecision(dialog.proposal, 'Accept')">Accept proposal</button>
              </div>
            }
          } @else if (dialog.kind === 'opportunity') {
            <div class="opportunity-hero">
              <p class="eyebrow">{{ dialog.opportunityType }} opportunity</p>
              <div class="opportunity-heading-row">
                <div>
                  <span class="opportunity-category">{{ dialog.category }}</span>
                  <h2>{{ dialog.title }}</h2>
                  <p class="opportunity-company">A collaboration with <strong>{{ dialog.companyName }}</strong></p>
                </div>
                <span class="opportunity-status">{{ dialog.status }}</span>
              </div>
              <div class="opportunity-budget">
                <span>CREATOR BUDGET</span>
                <strong>{{ dialog.budget }}</strong>
              </div>
            </div>
            <p class="opportunity-description">{{ dialog.description }}</p>
            <dl class="opportunity-metrics">
              @for (detail of dialog.metrics; track detail.label) {
                <div><dt>{{ detail.label }}</dt><dd>{{ detail.value }}</dd></div>
              }
            </dl>
            @if (dialog.canManageCreators && dialog.creatorCandidates?.length) {
              <section class="related-jobs opportunity-creators">
                <div class="related-jobs-heading">
                  <h3>Interested & shortlisted creators</h3>
                  <span>{{ dialog.creatorCandidates?.length }}</span>
                </div>
                <div class="dialog-list">
                  @for (creator of dialog.creatorCandidates; track creator.creatorId + creator.sourceId) {
                    <article class="opportunity-creator-row">
                      <button type="button" class="dialog-reference-link" (click)="openCreatorReference(creator.creatorId)">
                        <strong>{{ creator.creatorName }}</strong>
                        <span>{{ creator.niche }} · {{ formatAudience(creator.audienceSize) }} audience · {{ creator.engagementRate }}% engagement</span>
                        <small>{{ creator.sourceTitle }} · @if (creator.interested) { Registered interest } @if (creator.shortlisted) { · Shortlisted }</small>
                      </button>
                      <div class="opportunity-creator-actions">
                        <button type="button" class="dialog-secondary"
                          (click)="dialogs.toggleOpportunityShortlist(creator.sourceType, creator.sourceId, creator.creatorId)">
                          {{ creator.shortlisted ? 'Remove shortlist' : 'Shortlist' }}
                        </button>
                        <button type="button" class="dialog-primary"
                          [disabled]="hasCompanyProposal(creator.creatorId, creator.sourceType, creator.sourceId)"
                          (click)="beginCompanyProposal(dialog, creator)">
                          {{ hasCompanyProposal(creator.creatorId, creator.sourceType, creator.sourceId) ? 'Proposal sent' : 'Send proposal' }}
                        </button>
                      </div>
                    </article>
                  }
                </div>
              </section>
            } @else if (dialog.canManageCreators) {
              <section class="related-jobs opportunity-creators">
                <div class="related-jobs-heading"><h3>Interested & shortlisted creators</h3><span>0</span></div>
                <p class="related-jobs-empty">Creator registrations and shortlist entries will appear here.</p>
              </section>
            }
            @if (dialog.opportunityType === 'Campaign') {
              <section class="related-jobs">
                <div class="related-jobs-heading">
                  <h3>Jobs in this campaign</h3>
                  <span>{{ dialog.relatedJobs.length }}</span>
                </div>
                @if (dialog.relatedJobs.length) {
                  <div class="dialog-list">
                    @for (item of dialog.relatedJobs; track item.title) {
                      <article>
                        @if (item.jobId) {
                          <button type="button" class="dialog-reference-link" (click)="openJobReference(item.jobId)">
                            <strong>{{ item.title }}</strong><span>{{ item.subtitle }}</span>
                          </button>
                        } @else {
                          <div><strong>{{ item.title }}</strong><span>{{ item.subtitle }}</span></div>
                        }
                        @if (item.meta) { <small>{{ item.meta }}</small> }
                      </article>
                    }
                  </div>
                } @else {
                  <p class="related-jobs-empty">This campaign hasn’t added any jobs yet.</p>
                }
              </section>
            }
            @if (dialog.opportunityType === 'Job' && dialog.submissions?.length
              && ((dialog.viewerType === 'company' && dialog.companyName === currentUserName())
                || (dialog.viewerType === 'creator' && hasViewerSubmission(dialog)))) {
              <section class="related-jobs opportunity-submissions">
                <div class="related-jobs-heading"><h3>Submitted deliverables</h3><span>{{ dialog.submissions?.length }}</span></div>
                <div class="dialog-list">
                  @for (submission of dialog.submissions; track submission.id) {
                    <article>
                      <div><strong>{{ submission.creatorName }}</strong><span>{{ submission.type === 'url' ? 'Content link' : submission.fileName }}</span></div>
                      <a [href]="submission.url" target="_blank" rel="noopener noreferrer">Open</a>
                      <small>{{ submission.status }}</small>
                      @if (dialog.viewerType === 'company' && dialog.companyName === currentUserName() && submission.status === 'Pending review') {
                        <button type="button" class="dialog-review-action" (click)="approveOpportunitySubmission(dialog, submission.id)">Approve & complete</button>
                      }
                    </article>
                  }
                </div>
              </section>
            }
            <div class="opportunity-dialog-actions">
              @if (dialog.canRegister) {
                <button type="button" class="dialog-primary" (click)="dialogs.toggleOpportunityRegistration()">
                  {{ dialog.isRegistered ? 'Withdraw interest' : 'Register interest' }}
                </button>
              }
              @if (dialog.opportunityType === 'Job' && dialog.status === 'Accepted partnership' && dialog.viewerType === 'creator') {
                <button type="button" class="dialog-primary" (click)="manageAcceptedJob(dialog.opportunityId)">Manage deliverables</button>
              }
              <button type="button" class="dialog-secondary" (click)="dialogs.close()">Close</button>
            </div>
          } @else if (dialog.kind === 'list') {
            <p class="eyebrow">{{ dialog.eyebrow }}</p>
            <h2>{{ dialog.title }}</h2>
            <p class="dialog-description">{{ dialog.description }}</p>
            <div class="dialog-list">
              @for (item of dialog.items; track $index) {
                <article>
                  @if (item.campaignId) {
                    <button type="button" class="dialog-reference-link" (click)="openCampaignReference(item.campaignId)">
                      <strong>{{ item.title }}</strong><span>{{ item.subtitle }}</span>
                    </button>
                  } @else if (item.jobId) {
                    <button type="button" class="dialog-reference-link" (click)="openJobReference(item.jobId)">
                      <strong>{{ item.title }}</strong><span>{{ item.subtitle }}</span>
                    </button>
                  } @else if (item.creatorId) {
                    <button type="button" class="dialog-reference-link" (click)="openCreatorReference(item.creatorId)">
                      <strong>{{ item.title }}</strong><span>{{ item.subtitle }}</span>
                    </button>
                  } @else {
                    <div><strong>{{ item.title }}</strong><span>{{ item.subtitle }}</span></div>
                  }
                  @if (item.meta) { <small>{{ item.meta }}</small> }
                </article>
              } @empty {
                <p class="dialog-empty">Nothing to show yet.</p>
              }
            </div>
          } @else if (dialog.kind === 'creator-job') {
            <div class="creator-job-hero">
              <p class="eyebrow">ACCEPTED PARTNERSHIP</p>
              <div class="creator-job-heading">
                <div><span>{{ dialog.job.companyName }}</span><h2>{{ dialog.job.title }}</h2></div>
                <span class="creator-job-status">{{ currentJob(dialog.job).deliverableSubmissions.length ? submittedDeliverable(dialog.job)?.status : 'In progress' }}</span>
              </div>
              <p>{{ dialog.job.description }}</p>
              <div class="creator-job-quick-facts">
                <span><small>AGREED FEE</small><strong>{{ dialog.proposal.amount }}</strong></span>
                <span><small>DELIVERY DUE</small><strong>{{ formatJobDate(dialog.job.deliveryDeadline) }}</strong></span>
                <span><small>CONTENT REVIEW</small><strong>{{ dialog.job.requiresContentReview ? 'Required' : 'Not required' }}</strong></span>
              </div>
            </div>
            <section class="creator-job-dialog-section">
              <h3>Agreed deliverables</h3>
              <p>{{ dialog.proposal.deliverables }}</p>
              <dl class="creator-job-detail-grid">
                <div><dt>Platforms</dt><dd>{{ dialog.proposal.platform }}</dd></div>
                <div><dt>Timeline</dt><dd>{{ dialog.proposal.timeline }}</dd></div>
                <div><dt>Usage rights</dt><dd>{{ dialog.proposal.usageRights }}</dd></div>
              </dl>
            </section>
            <section class="creator-job-submit-section">
              <div>
                <p class="eyebrow">DELIVERABLE SUBMISSION</p>
                <h3>{{ submittedDeliverable(dialog.job) ? 'Your deliverable' : 'Submit your work' }}</h3>
                <p>{{ dialog.job.requiresContentReview
                  ? 'The brand will review your content before this job is marked complete.'
                  : 'Submit a link or upload your media to mark this job complete.' }}</p>
              </div>
              @if (submittedDeliverable(dialog.job); as submission) {
                <div class="submitted-deliverable">
                  <span class="submission-status" [class.completed]="submission.status === 'Completed'">{{ submission.status }}</span>
                  @if (submission.type === 'url') {
                    <a [href]="submission.url" target="_blank" rel="noopener noreferrer">{{ submission.url }}</a>
                  } @else {
                    <a [href]="submission.url" [download]="submission.fileName">{{ submission.fileName }}</a>
                    <small>{{ formatFileSize(submission.fileSize ?? 0) }}</small>
                  }
                  <small>Submitted {{ formatSubmissionDate(submission.submittedAt) }}</small>
                </div>
              } @else {
                <form class="deliverable-form" (ngSubmit)="submitJobDeliverable(dialog.job)">
                  <label>Submission type
                    <select name="submissionType" [(ngModel)]="deliverableSubmissionType" (ngModelChange)="resetDeliverableAttachment()">
                      <option value="url">Share a URL</option>
                      <option value="file">Upload media</option>
                    </select>
                  </label>
                  @if (deliverableSubmissionType === 'url') {
                    <label>Content link<input name="deliverableUrl" type="url" [(ngModel)]="deliverableUrl" placeholder="https://…" required /></label>
                  } @else {
                    <label>Media file<input name="deliverableFile" type="file" (change)="selectDeliverableFile($event)" required /></label>
                    @if (selectedDeliverableFile) {
                      <p class="selected-file">{{ selectedDeliverableFile.name }} · {{ formatFileSize(selectedDeliverableFile.size) }}</p>
                    }
                  }
                  <button class="dialog-primary" type="submit" [disabled]="deliverableSubmissionType === 'file' && !selectedDeliverableFile">
                    Submit deliverable
                  </button>
                </form>
              }
            </section>
          } @else if (dialog.kind === 'compose-company-proposal') {
            <p class="eyebrow">COMPANY WORKSPACE</p>
            <h2>Send a proposal</h2>
            <p class="dialog-description">Prepare an offer for {{ dialog.draft.creatorName }} on {{ dialog.draft.opportunityTitle }}.</p>
            <form class="dialog-form" (ngSubmit)="sendCompanyProposal(dialog.draft, $event)">
              <label>Offer (USD)<input name="proposalAmount" type="number" min="1" step="1" [value]="companyProposalDraft.amount" (input)="updateProposalAmount($event)" required /></label>
              <label>Deliverables<textarea name="proposalDeliverables" rows="2" [value]="companyProposalDraft.deliverables" (input)="updateProposalText('deliverables', $event)" required></textarea></label>
              <label>Platforms<input name="proposalPlatforms" [value]="companyProposalDraft.platforms" (input)="updateProposalText('platforms', $event)" placeholder="e.g. Instagram and TikTok" required /></label>
              <label>Timeline<input name="proposalTimeline" [value]="companyProposalDraft.timeline" (input)="updateProposalText('timeline', $event)" placeholder="e.g. Draft due Nov 5, publish by Nov 20" required /></label>
              <label>Usage rights<input name="proposalUsageRights" [value]="companyProposalDraft.usageRights" (input)="updateProposalText('usageRights', $event)" placeholder="e.g. Organic social usage for 90 days" required /></label>
              <label>Brief<textarea name="proposalBrief" rows="3" [value]="companyProposalDraft.brief" (input)="updateProposalText('brief', $event)" required></textarea></label>
              <div class="dialog-actions">
                <button type="button" class="dialog-secondary" (click)="returnToOpportunity()">Back</button>
                <button type="submit" class="dialog-primary">Send proposal</button>
              </div>
            </form>
          } @else if (dialog.kind === 'company-proposal') {
            <div class="proposal-dialog-hero">
              <p class="eyebrow">SENT PROPOSAL</p>
              <div class="proposal-dialog-heading">
                <div><span class="proposal-brand-label">{{ dialog.proposal.creatorName }}</span><h2>{{ dialog.proposal.opportunityTitle }}</h2></div>
                <span class="proposal-dialog-status">{{ dialog.proposal.status }}</span>
              </div>
              <p class="proposal-dialog-submitted">Sent {{ formatSubmissionDate(dialog.proposal.sentAt) }}</p>
              <div class="proposal-offer"><span>OFFER</span><strong>{{ formatProposalAmount(dialog.proposal.amount) }}</strong></div>
            </div>
            <section class="proposal-dialog-section">
              <h3>Proposal details</h3>
              <dl class="proposal-dialog-details">
                <div><dt>Opportunity</dt><dd>{{ dialog.proposal.opportunityType }}</dd></div>
                <div><dt>Deliverables</dt><dd>{{ dialog.proposal.deliverables }}</dd></div>
                <div><dt>Platforms</dt><dd>{{ dialog.proposal.platforms }}</dd></div>
                <div><dt>Timeline</dt><dd>{{ dialog.proposal.timeline }}</dd></div>
                <div><dt>Usage rights</dt><dd>{{ dialog.proposal.usageRights }}</dd></div>
              </dl>
            </section>
            <section class="proposal-dialog-brief"><h3>Brief for {{ dialog.proposal.creatorName }}</h3><p>{{ dialog.proposal.brief }}</p></section>
            @if (isProposalRecipient(dialog.proposal) && dialog.proposal.status === 'Sent') {
              <div class="proposal-dialog-actions">
                <button type="button" class="proposal-decline-button" (click)="respondToCompanyProposal(dialog.proposal.id, 'Declined')">Decline</button>
                <button type="button" class="proposal-accept-button" (click)="respondToCompanyProposal(dialog.proposal.id, 'Accepted')">Accept proposal</button>
              </div>
            }
          } @else if (dialog.kind === 'create-job') {
            <p class="eyebrow">COMPANY WORKSPACE</p>
            <h2>Create a job</h2>
            <p class="dialog-description">Set the details and deadlines for this creator opportunity.</p>
            <form class="dialog-form" (ngSubmit)="createJob()">
              <label>Job title<input name="jobTitle" [(ngModel)]="jobDraft.title" required /></label>
              <div class="dialog-form-row">
                <label>Category<input name="jobCategory" [(ngModel)]="jobDraft.category" required /></label>
                <label>Creator capacity<input name="jobCapacity" type="number" min="1" [(ngModel)]="jobDraft.creatorCapacity" required /></label>
              </div>
              <label>Campaign (optional)
                <select name="jobCampaign" [(ngModel)]="jobDraft.campaignId">
                  <option value="">Standalone job</option>
                  @for (campaign of companyCampaigns(); track campaign.id) {
                    <option [value]="campaign.id">{{ campaign.title }}</option>
                  }
                </select>
              </label>
              <label>Description<textarea name="jobDescription" rows="3" [(ngModel)]="jobDraft.description" required></textarea></label>
              <div class="dialog-form-row">
                <label>Minimum budget<input name="budgetMin" type="number" min="0" [(ngModel)]="jobDraft.budgetMin" required /></label>
                <label>Maximum budget<input name="budgetMax" type="number" [min]="jobDraft.budgetMin" [(ngModel)]="jobDraft.budgetMax" required /></label>
              </div>
              <div class="dialog-form-row">
                <label>Interest deadline<input name="interestDeadline" type="date" [(ngModel)]="jobDraft.interestDeadline" required /></label>
                <label>Delivery deadline<input name="deliveryDeadline" type="date" [min]="jobDraft.interestDeadline" [(ngModel)]="jobDraft.deliveryDeadline" required /></label>
              </div>
              <label class="review-toggle">
                <input name="requiresContentReview" type="checkbox" [(ngModel)]="jobDraft.requiresContentReview" />
                <span><strong>Require content review before completion</strong><small>Creators submit a draft for approval before the job is marked complete.</small></span>
              </label>
              <div class="dialog-actions">
                <button type="button" class="dialog-secondary" (click)="dialogs.close()">Cancel</button>
                <button type="submit" class="dialog-primary">Create job</button>
              </div>
            </form>
          } @else {
            <p class="eyebrow">COMPANY WORKSPACE</p>
            <h2>Create a campaign</h2>
            <p class="dialog-description">Create a campaign to organize related jobs and set its creator capacity.</p>
            <form class="dialog-form" (ngSubmit)="createCampaign()">
              <label>Campaign name<input name="campaignTitle" [(ngModel)]="campaignDraft.title" required /></label>
              <label>Category / tag<input name="campaignCategory" [(ngModel)]="campaignDraft.category" placeholder="e.g. Fitness, Technology, Wellness" required /></label>
              <label>Description<textarea name="campaignDescription" rows="4" [(ngModel)]="campaignDraft.description" required></textarea></label>
              <label>Creator capacity<input name="campaignCapacity" type="number" min="1" [(ngModel)]="campaignDraft.creatorCapacity" required /></label>
              <div class="dialog-actions">
                <button type="button" class="dialog-secondary" (click)="dialogs.close()">Cancel</button>
                <button type="submit" class="dialog-primary">Create campaign</button>
              </div>
            </form>
          }
        </section>
      </div>
    }
    @if (dialogs.proposalConfirmation(); as confirmation) {
      <div class="proposal-confirm-backdrop" (click)="dialogs.cancelProposalDecision()">
        <section class="proposal-confirm-dialog" role="alertdialog" aria-modal="true"
          [attr.aria-label]="confirmation.decision + ' proposal confirmation'"
          (click)="$event.stopPropagation()">
          <span class="confirmation-mark" [class.decline]="confirmation.decision === 'Decline'">
            {{ confirmation.decision === 'Accept' ? '✓' : '!' }}
          </span>
          <p class="eyebrow">CONFIRM YOUR DECISION</p>
          <h2>{{ confirmation.title }}</h2>
          <p>{{ confirmation.description }}</p>
          <div class="dialog-actions">
            <button type="button" class="dialog-secondary" (click)="dialogs.cancelProposalDecision()">Go back</button>
            <button type="button" class="dialog-primary" [class.confirm-decline]="confirmation.decision === 'Decline'"
              (click)="dialogs.applyProposalDecision()">{{ confirmation.confirmLabel }}</button>
          </div>
        </section>
      </div>
    }
  `
})
export class DialogHostComponent {
  protected readonly dialogs = inject(DialogService);
  protected readonly workspace = inject(MarketplaceWorkspaceService);
  private readonly session = inject(SessionService);
  protected jobDraft = this.newJobDraft();
  protected campaignDraft = { title: '', category: '', description: '', creatorCapacity: 5 };
  protected companyProposalDraft = this.newCompanyProposalDraft();
  protected proposalSourceDialog: OpportunityDialogData | null = null;
  protected readonly companyCampaigns = computed(() =>
    this.workspace.campaigns().filter((campaign) => campaign.companyName === this.session.currentUser()?.name)
  );
  protected deliverableSubmissionType: 'url' | 'file' = 'url';
  protected deliverableUrl = '';
  protected selectedDeliverableFile: File | null = null;

  protected currentUserName(): string | undefined {
    return this.session.currentUser()?.name;
  }

  protected dialogAriaLabel(dialog: AppDialog): string {
    switch (dialog.kind) {
      case 'create-job': return 'Create job';
      case 'create-campaign': return 'Create campaign';
      case 'compose-company-proposal': return `Proposal for ${dialog.draft.creatorName}`;
      case 'proposal': return dialog.proposal.campaign;
      case 'company-proposal': return dialog.proposal.opportunityTitle;
      case 'creator-job': return dialog.job.title;
      case 'opportunity': return dialog.title;
      case 'details':
      case 'list': return dialog.title;
    }
  }

  protected isProposalRecipient(proposal: CompanyProposal): boolean {
    const user = this.session.currentUser();
    return user?.type === 'creator'
      && (user.accountId ? user.accountId === proposal.creatorId : user.name === proposal.creatorName);
  }

  protected respondToCompanyProposal(proposalId: string, decision: 'Accepted' | 'Declined'): void {
    this.dialogs.respondToCompanyProposal(proposalId, decision);
  }

  protected formatAudience(count: number): string {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(count);
  }

  protected formatProposalAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  }

  private newCompanyProposalDraft() {
    return {
      amount: 2000,
      deliverables: '',
      platforms: '',
      timeline: '',
      usageRights: '',
      brief: ''
    };
  }

  protected hasViewerSubmission(dialog: Extract<AppDialog, { kind: 'opportunity' }>): boolean {
    const email = this.session.currentUser()?.email;
    return Boolean(email && dialog.submissions?.some((submission) => submission.creatorEmail === email));
  }

  protected openCampaignReference(campaignId: string): void {
    this.dialogs.openCampaignById(campaignId);
  }

  protected openJobReference(jobId: string): void {
    this.dialogs.openJobById(jobId);
  }

  protected openCreatorReference(creatorId: string): void {
    this.dialogs.openCreatorProfile(creatorId);
  }

  protected beginCompanyProposal(dialog: OpportunityDialogData, creator: OpportunityCreator): void {
    this.proposalSourceDialog = dialog;
    this.dialogs.openCompanyProposalComposer(creator);
  }

  protected hasCompanyProposal(creatorId: string, opportunityType: 'Campaign' | 'Job', opportunityId: string): boolean {
    const companyName = this.session.currentUser()?.name;
    return companyName
      ? this.workspace.hasCompanyProposal(creatorId, opportunityType, opportunityId, companyName)
      : false;
  }

  protected returnToOpportunity(): void {
    if (!this.proposalSourceDialog) {
      throw new Error('The originating opportunity dialog is unavailable.');
    }
    this.dialogs.openOpportunity(this.proposalSourceDialog);
    this.proposalSourceDialog = null;
  }

  protected sendCompanyProposal(draft: CompanyProposalDraft, event: Event): void {
    const companyName = this.session.currentUser()?.name;
    if (this.session.currentUser()?.type !== 'company' || !companyName) {
      throw new Error('A signed-in company account is required to send proposals.');
    }
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('Expected the proposal form as the submit event target.');
    }
    const formData = new FormData(form);
    this.workspace.sendCompanyProposal({
      ...draft,
      amount: Number(formData.get('proposalAmount')),
      deliverables: String(formData.get('proposalDeliverables') ?? '').trim(),
      platforms: String(formData.get('proposalPlatforms') ?? '').trim(),
      timeline: String(formData.get('proposalTimeline') ?? '').trim(),
      usageRights: String(formData.get('proposalUsageRights') ?? '').trim(),
      brief: String(formData.get('proposalBrief') ?? '').trim()
    }, companyName);
    this.proposalSourceDialog = null;
    this.dialogs.close();
  }

  protected updateProposalText(field: 'deliverables' | 'platforms' | 'timeline' | 'usageRights' | 'brief', event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      throw new Error('Expected a text field for the proposal draft.');
    }
    this.companyProposalDraft = { ...this.companyProposalDraft, [field]: target.value };
  }

  protected updateProposalAmount(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      throw new Error('Expected a number input for the proposal amount.');
    }
    this.companyProposalDraft = { ...this.companyProposalDraft, amount: Number(target.value) };
  }

  protected manageAcceptedJob(jobId: string | undefined): void {
    if (!jobId) {
      throw new Error('The accepted job reference is missing.');
    }
    const job = this.workspace.jobs().find((candidate) => candidate.id === jobId);
    const proposal = creatorProposals.find((candidate) =>
      candidate.status === 'Accepted'
      && candidate.campaign === job?.title
      && candidate.brand === job?.companyName
    );
    if (!job || !proposal) {
      throw new Error(`Accepted job ${jobId} or its proposal was not found.`);
    }
    this.dialogs.openCreatorJob(job, proposal);
  }

  protected approveOpportunitySubmission(dialog: Extract<AppDialog, { kind: 'opportunity' }>, submissionId: string): void {
    const companyName = this.session.currentUser()?.name;
    if (dialog.opportunityType !== 'Job' || !dialog.opportunityId || !companyName || companyName !== dialog.companyName) {
      throw new Error('A signed-in owning company is required to approve this deliverable.');
    }
    this.workspace.approveDeliverable(dialog.opportunityId, submissionId, companyName);
    this.dialogs.openJobById(dialog.opportunityId);
  }

  constructor() {
    effect(() => {
      const kind = this.dialogs.activeDialog()?.kind;
      if (kind === 'create-job') {
        this.jobDraft = this.newJobDraft();
      } else if (kind === 'create-campaign') {
        this.campaignDraft = { title: '', category: '', description: '', creatorCapacity: 5 };
      } else if (kind === 'creator-job') {
        this.deliverableSubmissionType = 'url';
        this.deliverableUrl = '';
        this.selectedDeliverableFile = null;
      } else if (kind === 'compose-company-proposal') {
        this.companyProposalDraft = this.newCompanyProposalDraft();
      }
    });
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.dialogs.proposalConfirmation()) {
      this.dialogs.cancelProposalDecision();
    } else {
      this.dialogs.close();
    }
  }

  protected requestProposalDecision(proposal: CreatorProposal, decision: 'Accept' | 'Decline'): void {
    const nextStatus = decision === 'Accept' ? 'Accepted' : 'Declined';
    this.dialogs.confirmProposalDecision({
      decision,
      title: `${decision} this proposal?`,
      description: decision === 'Accept'
        ? `You’re agreeing to ${proposal.amount} for “${proposal.campaign}” with ${proposal.brand}. This decision will update the proposal status.`
        : `You’re declining “${proposal.campaign}” from ${proposal.brand}. The proposal will be marked declined.`,
      confirmLabel: decision === 'Accept' ? 'Confirm acceptance' : 'Confirm decline',
      onConfirm: () => {
        const storedProposal = creatorProposals.find((candidate) => candidate.id === proposal.id);
        if (!storedProposal) {
          throw new Error(`Proposal ${proposal.id} was not found.`);
        }
        storedProposal.status = nextStatus;
      }
    });
  }

  protected createJob(): void {
    const draft = this.jobDraft;
    this.workspace.addJob({
      campaignId: draft.campaignId || null,
      companyName: this.session.currentUser()?.name ?? 'Your company',
      title: draft.title.trim(),
      category: draft.category.trim(),
      description: draft.description.trim(),
      budgetMin: Number(draft.budgetMin),
      budgetMax: Number(draft.budgetMax),
      interestDeadline: draft.interestDeadline,
      deliveryDeadline: draft.deliveryDeadline,
      creatorCapacity: Number(draft.creatorCapacity),
      requiresContentReview: draft.requiresContentReview
    });
    this.dialogs.close();
  }

  protected createCampaign(): void {
    this.workspace.addCampaign({
      companyName: this.session.currentUser()?.name ?? 'Your company',
      title: this.campaignDraft.title.trim(),
      category: this.campaignDraft.category.trim(),
      description: this.campaignDraft.description.trim(),
      creatorCapacity: Number(this.campaignDraft.creatorCapacity)
    });
    this.dialogs.close();
  }

  protected currentJob(job: JobOpportunity): JobOpportunity {
    return this.workspace.jobs().find((candidate) => candidate.id === job.id) ?? job;
  }

  protected submittedDeliverable(job: JobOpportunity) {
    const email = this.session.currentUser()?.email;
    return this.currentJob(job).deliverableSubmissions.find((submission) => submission.creatorEmail === email);
  }

  protected selectDeliverableFile(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('Expected a file input for deliverable upload.');
    }
    this.selectedDeliverableFile = input.files?.[0] ?? null;
  }

  protected resetDeliverableAttachment(): void {
    this.deliverableUrl = '';
    this.selectedDeliverableFile = null;
  }

  protected submitJobDeliverable(job: JobOpportunity): void {
    const user = this.session.currentUser();
    if (!user || user.type !== 'creator') {
      throw new Error('A signed-in creator is required to submit a deliverable.');
    }
    if (this.deliverableSubmissionType === 'url') {
      this.workspace.submitDeliverable(job.id, user.name, user.email, {
        type: 'url',
        url: this.deliverableUrl.trim()
      });
    } else {
      if (!this.selectedDeliverableFile) {
        throw new Error('Choose a media file before submitting the deliverable.');
      }
      this.workspace.submitDeliverable(job.id, user.name, user.email, {
        type: 'file',
        file: this.selectedDeliverableFile
      });
    }
  }

  protected formatJobDate(date: string): string {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
  }

  protected formatSubmissionDate(date: string): string {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date));
  }

  protected formatFileSize(bytes: number): string {
    return bytes < 1_000_000 ? `${Math.max(1, Math.round(bytes / 1_000))} KB` : `${(bytes / 1_000_000).toFixed(1)} MB`;
  }

  private newJobDraft() {
    return {
      title: '',
      category: '',
      creatorCapacity: 3,
      campaignId: '',
      description: '',
      budgetMin: 1000,
      budgetMax: 3000,
      interestDeadline: this.dateAfterDays(7),
      deliveryDeadline: this.dateAfterDays(21),
      requiresContentReview: false
    };
  }

  private dateAfterDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
