import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.html',
})
export class LandingComponent {
  protected readonly opportunities = [
    { category: 'WELLNESS', title: 'Move with Morrow', detail: 'Creator campaign · 3 weeks', budget: '$2.4k–$5k', color: 'mint' },
    { category: 'FOOD & DRINK', title: 'Good things brewing', detail: 'Product launch · 1 month', budget: '$1k–$3k', color: 'peach' },
    { category: 'TRAVEL', title: 'Take the scenic route', detail: 'Weekend partnership', budget: '$3k–$8k', color: 'blue' }
  ];
}
