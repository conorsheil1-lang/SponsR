import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-portal-selection',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="portal-shell">
      <div class="portal-header">
        <p class="eyebrow">Choose your portal</p>
        <h2>Where do you want to work today?</h2>
      </div>

      <div class="portal-grid">
        <article class="portal-card creator">
          <div class="portal-icon">🎤</div>
          <h3>Creator Portal</h3>
          <p>Build media kits, respond to briefs, and track deal progress.</p>
          <ul>
            <li>Media kit builder</li>
            <li>Pitch proposals</li>
            <li>Campaign milestones</li>
          </ul>
          <a routerLink="/creator" class="portal-link">Enter creator workspace</a>
        </article>

        <article class="portal-card sponsor">
          <div class="portal-icon">🏢</div>
          <h3>Company Portal</h3>
          <p>Discover creators, post briefs, and review escrow-backed campaigns.</p>
          <ul>
            <li>Creator discovery</li>
            <li>Brand brief board</li>
            <li>Escrow approvals</li>
          </ul>
          <a routerLink="/company" class="portal-link">Enter sponsor workspace</a>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .portal-shell {
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
      }
      .portal-header {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .portal-header h2 {
        margin: 0;
        font-size: clamp(1.8rem, 2vw, 2.4rem);
      }
      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.72rem;
        color: #7cc9ff;
      }
      .portal-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
      }
      .portal-card {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 24px;
        padding: 1.3rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .portal-card.creator {
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(15, 23, 42, 0.8));
      }
      .portal-card.sponsor {
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(15, 23, 42, 0.8));
      }
      .portal-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        font-size: 1.5rem;
        background: rgba(255, 255, 255, 0.08);
      }
      .portal-card h3 {
        margin: 0;
        font-size: 1.7rem;
      }
      .portal-card p,
      .portal-card li {
        margin: 0;
        color: #bfd2ff;
      }
      .portal-card ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .portal-link {
        margin-top: auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.8rem 1rem;
        border-radius: 999px;
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
        color: white;
        text-decoration: none;
        font-weight: 600;
      }
    `
  ]
})
export class PortalSelectionComponent {}
