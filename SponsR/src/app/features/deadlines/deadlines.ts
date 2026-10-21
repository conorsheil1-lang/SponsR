import { Component } from '@angular/core';
import { creatorDeadlines } from '../../core/creator-workspace-data';

@Component({
  selector: 'app-deadlines',
  standalone: true,
  template: `
    <section class="creator-workspace-page">
      <header class="workspace-page-heading">
        <div>
          <p class="eyebrow">CREATOR WORKSPACE</p>
          <h2>Deadlines</h2>
          <p>Everything coming up for your active partnerships, all in one place.</p>
        </div>
        <span class="page-count">{{ deadlines.length }} upcoming</span>
      </header>

      <div class="deadline-list">
        @for (deadline of deadlines; track deadline.id) {
          <article class="creator-workspace-card deadline-item">
            <span class="deadline-date" [class.due-soon]="deadline.daysRemaining <= 1">{{ deadline.dueDate }}</span>
            <div class="deadline-info">
              <h3>{{ deadline.task }}</h3>
              <p>{{ deadline.campaign }}</p>
            </div>
            <span class="deadline-priority" [class.due-soon]="deadline.daysRemaining <= 1">{{ deadline.priority }}</span>
          </article>
        } @empty {
          <p class="workspace-empty">No deadlines yet. Active campaign deliverables will appear here.</p>
        }
      </div>
    </section>
  `
})
export class DeadlinesComponent {
  protected readonly deadlines = creatorDeadlines;
}
