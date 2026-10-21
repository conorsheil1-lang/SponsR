import { TestBed } from '@angular/core/testing';
import { ProposalsComponent } from './proposals';

describe('ProposalsComponent', () => {
  it('shows creator proposal status and amount', async () => {
    await TestBed.configureTestingModule({ imports: [ProposalsComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ProposalsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Your proposals');
    expect(fixture.nativeElement.textContent).toContain('Shortlisted');
    expect(fixture.nativeElement.textContent).toContain('Mint & Moss');
  });
});
