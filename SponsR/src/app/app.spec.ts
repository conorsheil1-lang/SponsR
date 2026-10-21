import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { SessionService } from './core/session.service';

describe('App', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the shared site navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.site-brand')?.textContent).toContain('SponsR');
    expect(compiled.querySelector('.site-actions')?.textContent).toContain('Sign in');
    expect(compiled.querySelector('.site-actions')?.textContent).toContain('Sign up');
  });

  it('shows Discover without the signed-in workspace shell or overview summary', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/discovery');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-discovery')).toBeTruthy();
    expect(compiled.querySelector('.sidebar')).toBeNull();
    expect(compiled.querySelector('.overview-grid')).toBeNull();
    expect(compiled.querySelector('.topbar')).toBeNull();
  });

  it('shows creator navigation only for a signed-in creator', async () => {
    const fixture = TestBed.createComponent(App);
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    session.signIn({ type: 'creator', name: 'Maya Chen', email: 'creator@sponsr.com' });
    await router.navigateByUrl('/creator');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.sidebar')).toBeTruthy();
    expect(compiled.querySelector('.user-card')?.textContent).toContain('Maya Chen');
    expect(compiled.querySelector('.nav')?.textContent).toContain('Media Kit');
    expect(compiled.querySelector('.nav')?.textContent).not.toContain('Company Portal');
  });

  it('shows company navigation only for a signed-in company', async () => {
    const fixture = TestBed.createComponent(App);
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    session.signIn({ type: 'company', name: 'Northstar Labs', email: 'company@sponsr.com' });
    await router.navigateByUrl('/company');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.sidebar')).toBeTruthy();
    expect(compiled.querySelector('.nav')?.textContent).toContain('Company Portal');
    expect(compiled.querySelector('.nav')?.textContent).not.toContain('Media Kit');
  });

  it('keeps sign-up public and links it from the shared header', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/signup');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-signup')).toBeTruthy();
    expect(compiled.querySelector('.sidebar')).toBeNull();
    expect(compiled.querySelector('.site-actions a[routerlink="/signup"]')?.textContent).toContain('Sign up');
  });
});
