import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../app.routes';
import { SessionService } from '../../core/session.service';
import { SignupComponent } from './signup';

describe('SignupComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('creates and signs in a creator account', async () => {
    const fixture = TestBed.createComponent(SignupComponent);
    const component = fixture.componentInstance;
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    component.nameInput.set('  Avery Lane  ');
    component.emailInput.set(' Avery@example.com ');
    component.passwordInput.set('long-enough-password');

    component.createAccount();
    await fixture.whenStable();

    expect(session.currentUser()).toEqual({
      type: 'creator',
      name: 'Avery Lane',
      email: 'avery@example.com'
    });
    expect(router.url).toBe('/creator');
  });

  it('creates and signs in a company account', async () => {
    const fixture = TestBed.createComponent(SignupComponent);
    const component = fixture.componentInstance;
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    component.selectedType.set('company');
    component.nameInput.set('River Studio');
    component.emailInput.set('hello@river.example');
    component.passwordInput.set('long-enough-password');

    component.createAccount();
    await fixture.whenStable();

    expect(session.currentUser()?.type).toBe('company');
    expect(router.url).toBe('/company');
  });

  it('does not sign in with missing details or a short password', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    const component = fixture.componentInstance;
    const session = TestBed.inject(SessionService);
    component.nameInput.set('Avery');
    component.emailInput.set('avery@example.com');
    component.passwordInput.set('short');

    component.createAccount();

    expect(session.currentUser()).toBeNull();
    expect(component.errorMessage()).toContain('at least 8 characters');
  });
});
