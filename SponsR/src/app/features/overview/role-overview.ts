import { Component, inject } from '@angular/core';
import { SessionService } from '../../core/session.service';
import { CreatorOverviewComponent } from './creator-overview';
import { OverviewComponent } from './overview';

@Component({
  selector: 'app-role-overview',
  standalone: true,
  imports: [CreatorOverviewComponent, OverviewComponent],
  template: `
    @if (session.currentUser()?.type === 'creator') {
      <app-creator-overview />
    } @else {
      <app-overview />
    }
  `
})
export class RoleOverviewComponent {
  protected readonly session = inject(SessionService);
}
