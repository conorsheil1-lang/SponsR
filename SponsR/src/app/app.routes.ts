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
import { LandingComponent } from './features/landing/landing';
import { requireAccountType, requireSession } from './core/session.guard';
import { SignupComponent } from './features/signup/signup';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'overview', component: OverviewComponent, canActivate: [requireSession] },
  { path: 'portals', component: PortalSelectionComponent, canActivate: [requireSession] },
  { path: 'creator', component: CreatorPortalComponent, canActivate: [requireAccountType('creator')] },
  { path: 'company', component: CompanyPortalComponent, canActivate: [requireAccountType('company')] },
  { path: 'discovery', component: DiscoveryComponent },
  { path: 'media-kit', component: MediaKitComponent, canActivate: [requireAccountType('creator')] },
  { path: 'campaigns', component: CampaignsComponent, canActivate: [requireSession] },
  { path: 'messaging', component: MessagingComponent, canActivate: [requireSession] },
  { path: 'payments', component: PaymentsComponent, canActivate: [requireSession] },
  { path: '**', redirectTo: '' }
];
