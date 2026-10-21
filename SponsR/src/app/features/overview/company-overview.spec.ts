import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DialogService } from '../../core/dialog.service';
import { SessionService } from '../../core/session.service';
import { DialogHostComponent } from '../../shared/dialog-host';
import { CompanyOverviewComponent } from './company-overview';

describe('CompanyOverviewComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CompanyOverviewComponent, DialogHostComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('shows interested creators and opens their profiles from the full list', () => {
    TestBed.inject(SessionService).signIn({
      type: 'company',
      name: 'Northstar Labs',
      email: 'company@sponsr.com'
    });
    const dialogs = TestBed.inject(DialogService);
    const overview = TestBed.createComponent(CompanyOverviewComponent);
    const dialogHost = TestBed.createComponent(DialogHostComponent);
    overview.detectChanges();
    dialogHost.detectChanges();

    const interestPanel = Array.from(
      overview.nativeElement.querySelectorAll('.dashboard-panel') as NodeListOf<HTMLElement>
    ).find((panel) => panel.textContent?.includes('CREATOR INTEREST'));
    if (!interestPanel) {
      throw new Error('Expected the interested creators panel.');
    }
    (interestPanel.querySelector('.dashboard-view-action') as HTMLButtonElement).click();
    dialogHost.detectChanges();

    const listDialog = dialogs.activeDialog();
    expect(listDialog?.kind).toBe('list');
    if (listDialog?.kind !== 'list') {
      throw new Error('Expected the interested creator list dialog.');
    }
    expect(listDialog.title).toBe('Interested creators');
    expect(listDialog.items.length).toBeGreaterThan(0);
    expect(listDialog.items.every((item) => Boolean(item.creatorId))).toBe(true);
    expect(listDialog.items[0].subtitle).toContain('Interested in');

    (dialogHost.nativeElement.querySelector('.dialog-reference-link') as HTMLButtonElement).click();
    dialogHost.detectChanges();
    expect(dialogs.activeDialog()?.kind).toBe('details');
    expect(dialogHost.nativeElement.textContent).toContain('Content tags');
    expect(dialogHost.nativeElement.textContent).toContain('Typical rate');
  });

  it('makes every shortlisted creator in the full list openable', () => {
    TestBed.inject(SessionService).signIn({
      type: 'company',
      name: 'Northstar Labs',
      email: 'company@sponsr.com'
    });
    const dialogs = TestBed.inject(DialogService);
    const overview = TestBed.createComponent(CompanyOverviewComponent);
    const dialogHost = TestBed.createComponent(DialogHostComponent);
    overview.detectChanges();
    dialogHost.detectChanges();

    const shortlistPanel = Array.from(
      overview.nativeElement.querySelectorAll('.dashboard-panel') as NodeListOf<HTMLElement>
    ).find((panel) => panel.textContent?.includes('YOUR SHORTLIST'));
    if (!shortlistPanel) {
      throw new Error('Expected the shortlisted creators panel.');
    }
    (shortlistPanel.querySelector('.dashboard-view-action') as HTMLButtonElement).click();
    dialogHost.detectChanges();

    const listDialog = dialogs.activeDialog();
    expect(listDialog?.kind).toBe('list');
    if (listDialog?.kind !== 'list') {
      throw new Error('Expected the shortlisted creator list dialog.');
    }
    expect(listDialog.title).toBe('Shortlisted creators');
    expect(listDialog.items.length).toBeGreaterThan(0);
    expect(listDialog.items.every((item) => Boolean(item.creatorId))).toBe(true);

    (dialogHost.nativeElement.querySelector('.dialog-reference-link') as HTMLButtonElement).click();
    dialogHost.detectChanges();
    expect(dialogs.activeDialog()?.kind).toBe('details');
    expect(dialogHost.nativeElement.textContent).toContain('CREATOR PROFILE');
  });
});
