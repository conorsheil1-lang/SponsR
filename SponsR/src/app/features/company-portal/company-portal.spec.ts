import { TestBed } from '@angular/core/testing';
import { DialogService } from '../../core/dialog.service';
import { CompanyPortalComponent } from './company-portal';

describe('CompanyPortalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CompanyPortalComponent] }).compileComponents();
  });

  it('opens complete creator and campaign lists in dialogs without expanding the cards', () => {
    const fixture = TestBed.createComponent(CompanyPortalComponent);
    const dialogs = TestBed.inject(DialogService);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.content-grid > .panel-card');
    const creatorsCard = cards[0] as HTMLElement;
    const campaignsCard = cards[1] as HTMLElement;

    expect(creatorsCard.querySelectorAll('li')).toHaveLength(3);
    (creatorsCard.querySelector('.show-more-button') as HTMLButtonElement).click();
    const creatorsDialog = dialogs.activeDialog();
    expect(creatorsDialog?.kind).toBe('list');
    if (creatorsDialog?.kind !== 'list') {
      throw new Error('Expected creator matches list dialog.');
    }
    expect(creatorsDialog.items).toHaveLength(5);
    expect(creatorsCard.querySelectorAll('li')).toHaveLength(3);

    expect(campaignsCard.querySelectorAll('li')).toHaveLength(3);
    (campaignsCard.querySelector('.show-more-button') as HTMLButtonElement).click();
    const campaignsDialog = dialogs.activeDialog();
    if (campaignsDialog?.kind !== 'list') {
      throw new Error('Expected active campaigns list dialog.');
    }
    expect(campaignsDialog.items).toHaveLength(5);
    expect(campaignsCard.querySelectorAll('li')).toHaveLength(3);
  });
});
