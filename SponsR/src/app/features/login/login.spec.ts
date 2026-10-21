import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../app.routes';
import { mockCompanyAccounts, mockCreatorAccounts } from '../../core/marketplace-mock-data';
import { mockCompanyUser, mockCreatorUser } from '../../core/mock-users';
import { SessionService } from '../../core/session.service';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('routes a signed-in creator to Overview', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    component.emailInput.set('creator@sponsr.com');
    component.passwordInput.set('password');

    component.continueToPortal();
    await fixture.whenStable();

    expect(TestBed.inject(SessionService).currentUser()?.type).toBe('creator');
    expect(TestBed.inject(SessionService).currentUser()?.accountId).toBe('creator-maya-chen');
    expect(router.url).toBe('/overview');
  });

  it('routes a signed-in company to Overview', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    component.selectedType.set('company');
    component.emailInput.set('company@sponsr.com');
    component.passwordInput.set('password');

    component.continueToPortal();
    await fixture.whenStable();

    expect(TestBed.inject(SessionService).currentUser()?.type).toBe('company');
    expect(TestBed.inject(SessionService).currentUser()?.accountId).toBe('brand-northstar');
    expect(router.url).toBe('/overview');
  });

  it('uses complete typed profiles for its demo users', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('creator@sponsr.com');
    expect(fixture.nativeElement.textContent).toContain('company@sponsr.com');
    expect(fixture.nativeElement.textContent).toContain('Northstar Labs');
    expect(mockCreatorUser.profile.rateCard.length).toBeGreaterThan(0);
    expect(mockCreatorUser.profile.audienceDemographics.topLocations.length).toBeGreaterThan(0);
    expect(mockCompanyUser.profile.preferredPlatforms.length).toBeGreaterThan(0);
    expect(mockCompanyUser.profile.targetAudience).not.toBe('');
    expect(mockCreatorAccounts.some((creator) => creator.id === mockCreatorUser.profile.id)).toBe(true);
    expect(mockCompanyAccounts.some((company) => company.id === mockCompanyUser.profile.id)).toBe(true);
  });
});
