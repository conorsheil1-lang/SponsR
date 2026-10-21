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

  it('shows the signed-in workspace sidebar on Discover without the overview summary', async () => {
    const fixture = TestBed.createComponent(App);
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    session.signIn({ type: 'creator', name: 'Maya Chen', email: 'creator@sponsr.com' });
    await router.navigateByUrl('/discovery');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-discovery')).toBeTruthy();
    expect(compiled.querySelector('.sidebar')).toBeTruthy();
    expect(compiled.querySelector('.nav')?.textContent).toContain('Discover');
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
    expect(compiled.querySelector('.nav')?.textContent).toContain('Proposals');
    expect(compiled.querySelector('.nav')?.textContent).toContain('Deadlines');
    expect(compiled.querySelector('.nav')?.textContent).toContain('Payments');
    expect(compiled.querySelector('.nav')?.textContent).not.toContain('Company Portal');
    expect(compiled.querySelector('.nav')?.textContent).not.toContain('Messaging');
  });

  it('shows the creator overview dashboard with notifications and work summaries', async () => {
    const fixture = TestBed.createComponent(App);
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    session.signIn({ type: 'creator', name: 'Maya Chen', email: 'creator@sponsr.com' });
    await router.navigateByUrl('/overview');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-creator-overview')).toBeTruthy();
    expect(compiled.textContent).toContain('Notifications');
    expect(compiled.textContent).toContain('Next payout');
    expect(compiled.textContent).toContain('Recent proposals');
    expect(compiled.textContent).toContain('Upcoming deadlines');
    expect(compiled.textContent).toContain('Campaigns');
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

  it('hides public top navigation links when signed in', async () => {
    const fixture = TestBed.createComponent(App);
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    session.signIn({ type: 'creator', name: 'Maya Chen', email: 'creator@sponsr.com' });
    await router.navigateByUrl('/creator');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.site-nav')).toBeNull();
    expect(compiled.querySelector('.signed-in-name')?.textContent).toContain('Maya Chen');
    expect(compiled.querySelector<HTMLAnchorElement>('.signed-in-name')?.getAttribute('href')).toBe('/overview');
    expect(compiled.querySelector('.sign-out-button')).toBeTruthy();
  });

  it('navigates to Overview when the signed-in name is clicked', async () => {
    const fixture = TestBed.createComponent(App);
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    session.signIn({ type: 'creator', name: 'Maya Chen', email: 'creator@sponsr.com' });
    await router.navigateByUrl('/creator');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLAnchorElement>('.signed-in-name')?.click();
    await fixture.whenStable();

    expect(router.url).toBe('/overview');
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
