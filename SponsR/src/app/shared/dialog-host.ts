import { Component, computed, effect, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../core/dialog.service';
import { MarketplaceWorkspaceService } from '../core/marketplace-workspace.service';
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
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="dialog.kind === 'create-job' ? 'Create job' : dialog.kind === 'create-campaign' ? 'Create campaign' : dialog.title"
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
          } @else if (dialog.kind === 'list') {
            <p class="eyebrow">{{ dialog.eyebrow }}</p>
            <h2>{{ dialog.title }}</h2>
            <p class="dialog-description">{{ dialog.description }}</p>
            <div class="dialog-list">
              @for (item of dialog.items; track $index) {
                <article>
                  <div><strong>{{ item.title }}</strong><span>{{ item.subtitle }}</span></div>
                  @if (item.meta) { <small>{{ item.meta }}</small> }
                </article>
              } @empty {
                <p class="dialog-empty">Nothing to show yet.</p>
              }
            </div>
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
  `
})
export class DialogHostComponent {
  protected readonly dialogs = inject(DialogService);
  protected readonly workspace = inject(MarketplaceWorkspaceService);
  private readonly session = inject(SessionService);
  protected jobDraft = this.newJobDraft();
  protected campaignDraft = { title: '', category: '', description: '', creatorCapacity: 5 };
  protected readonly companyCampaigns = computed(() =>
    this.workspace.campaigns().filter((campaign) => campaign.companyName === this.session.currentUser()?.name)
  );

  constructor() {
    effect(() => {
      const kind = this.dialogs.activeDialog()?.kind;
      if (kind === 'create-job') {
        this.jobDraft = this.newJobDraft();
      } else if (kind === 'create-campaign') {
        this.campaignDraft = { title: '', category: '', description: '', creatorCapacity: 5 };
      }
    });
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.dialogs.close();
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
      creatorCapacity: Number(draft.creatorCapacity)
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
      deliveryDeadline: this.dateAfterDays(21)
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
