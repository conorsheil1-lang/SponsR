import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../app.routes';
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
    expect(router.url).toBe('/overview');
  });
});
