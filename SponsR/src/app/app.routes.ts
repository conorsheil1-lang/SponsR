import { Routes } from '@angular/router';
import { CompanyPortalComponent } from './features/company-portal/company-portal';
import { CreatorPortalComponent } from './features/creator-portal/creator-portal';
import { DiscoveryComponent } from './features/discovery/discovery';
import { MediaKitComponent } from './features/media-kit/media-kit';
import { CampaignsComponent } from './features/campaigns/campaigns';
import { MessagingComponent } from './features/messaging/messaging';
import { PaymentsComponent } from './features/payments/payments';
import { OverviewComponent } from './features/overview/overview';
import { PortalSelectionComponent } from './features/portal-selection/portal-selection';
import { LoginComponent } from './features/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'overview', component: OverviewComponent },
  { path: 'portals', component: PortalSelectionComponent },
  { path: 'creator', component: CreatorPortalComponent },
  { path: 'company', component: CompanyPortalComponent },
  { path: 'discovery', component: DiscoveryComponent },
  { path: 'media-kit', component: MediaKitComponent },
  { path: 'campaigns', component: CampaignsComponent },
  { path: 'messaging', component: MessagingComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: '**', redirectTo: 'login' }
];
