import { Component, inject } from '@angular/core';
import { SessionService } from '../../core/session.service';
import { CreatorOverviewComponent } from './creator-overview';
import { CompanyOverviewComponent } from './company-overview';

@Component({
  selector: 'app-role-overview',
  standalone: true,
  imports: [CreatorOverviewComponent, CompanyOverviewComponent],
  template: `
    @if (session.currentUser()?.type === 'creator') {
      <app-creator-overview />
    } @else {
      <app-company-overview />
    }
  `
})
export class RoleOverviewComponent {
  protected readonly session = inject(SessionService);
}
