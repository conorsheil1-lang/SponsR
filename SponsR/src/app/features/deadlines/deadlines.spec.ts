import { TestBed } from '@angular/core/testing';
import { DeadlinesComponent } from './deadlines';

describe('DeadlinesComponent', () => {
  it('shows creator deliverables and due dates', async () => {
    await TestBed.configureTestingModule({ imports: [DeadlinesComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DeadlinesComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Deadlines');
    expect(fixture.nativeElement.textContent).toContain('Submit first draft');
    expect(fixture.nativeElement.textContent).toContain('Today');
  });
});
