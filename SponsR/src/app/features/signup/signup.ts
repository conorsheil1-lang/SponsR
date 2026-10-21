import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountType, SessionService } from '../../core/session.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="auth-screen">
      <section class="auth-card">
        <div class="brand-row">
          <div class="brand-mark" aria-hidden="true">S</div>
          <span>SponsR</span>
        </div>

        <div class="intro">
          <p class="eyebrow">A good place to start</p>
          <h1>Create your account</h1>
        </div>

        <div class="account-picker" role="group" aria-label="Choose your account type">
          <button
            type="button"
            [class.active]="selectedType() === 'creator'"
            [attr.aria-pressed]="selectedType() === 'creator'"
            (click)="selectedType.set('creator')"
          >
            I’m a creator
          </button>
          <button
            type="button"
            [class.active]="selectedType() === 'company'"
            [attr.aria-pressed]="selectedType() === 'company'"
            (click)="selectedType.set('company')"
          >
            I’m a company
          </button>
        </div>

        <form class="signup-form" (ngSubmit)="createAccount()">
          <label>
            <span>{{ selectedType() === 'creator' ? 'Your name' : 'Company name' }}</span>
            <input
              type="text"
              name="name"
              [(ngModel)]="nameInput"
              [placeholder]="selectedType() === 'creator' ? 'e.g. Maya Chen' : 'e.g. Northstar Labs'"
              autocomplete="name"
              required
            />
          </label>

          <label>
            <span>Email address</span>
            <input
              type="email"
              name="email"
              [(ngModel)]="emailInput"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </label>

          <label>
            <span>Password <small>(at least 8 characters)</small></span>
            <input
              type="password"
              name="password"
              [(ngModel)]="passwordInput"
              placeholder="Create a password"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </label>

          @if (errorMessage()) {
            <p class="error-message" role="alert">{{ errorMessage() }}</p>
          }

          <button class="submit-button" type="submit">Create {{ selectedType() }} account <span aria-hidden="true">↗</span></button>
        </form>

        <p class="prototype-note">This prototype keeps your sign-in for the current browser session.</p>
        <p class="switch-auth">Already have an account? <a routerLink="/login">Sign in</a></p>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: calc(100vh - 76px);
      }

      .auth-screen {
        min-height: calc(100vh - 76px);
        display: grid;
        place-items: center;
        padding: 2rem;
        background: radial-gradient(circle at top, rgba(201, 225, 167, 0.42), transparent 42%), #f5f6f1;
      }

      .auth-card {
        width: min(100%, 460px);
        padding: 2rem;
        border: 1px solid #e6e9e1;
        border-radius: 24px;
        background: #fff;
        box-shadow: 0 20px 60px rgba(48, 65, 43, 0.1);
      }

      .brand-row {
        display: inline-flex;
        align-items: center;
        gap: 0.7rem;
        margin-bottom: 1rem;
        color: #25372a;
        font-weight: 750;
      }

      .brand-mark {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 11px;
        background: #c8f169;
        color: #1f3b28;
      }

      .eyebrow {
        margin: 0 0 0.45rem;
        color: #6b8e45;
        font-size: 0.66rem;
        font-weight: 750;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        color: #25372a;
        font-size: clamp(2rem, 4vw, 2.5rem);
        letter-spacing: -0.06em;
      }

      .intro {
        margin-bottom: 1.2rem;
      }

      .account-picker {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.55rem;
        margin-bottom: 1.2rem;
      }

      .account-picker button,
      input {
        border: 1px solid #e1e7dc;
        border-radius: 11px;
        background: #f8f9f6;
        color: #39483b;
        font: inherit;
      }

      .account-picker button {
        padding: 0.75rem 0.65rem;
        cursor: pointer;
        font-size: 0.83rem;
        font-weight: 650;
      }

      .account-picker button.active {
        border-color: #193b2a;
        background: #193b2a;
        color: #fff;
      }

      .signup-form {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.38rem;
        color: #344437;
        font-size: 0.8rem;
        font-weight: 600;
      }

      label small {
        color: #8a9488;
        font-size: 0.68rem;
        font-weight: 450;
      }

      input {
        width: 100%;
        padding: 0.78rem 0.85rem;
        font-size: 0.83rem;
      }

      input:focus {
        border-color: #91b26b;
        outline: 3px solid rgba(145, 178, 107, 0.18);
      }

      .submit-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 0.2rem;
        padding: 0.85rem 1rem;
        border: 0;
        border-radius: 999px;
        background: #193b2a;
        color: #fff;
        cursor: pointer;
        font: inherit;
        font-size: 0.85rem;
        font-weight: 700;
      }

      .submit-button:hover {
        background: #2b5a3e;
      }

      .error-message {
        margin: 0;
        color: #b33d3d;
        font-size: 0.8rem;
      }

      .prototype-note,
      .switch-auth {
        margin: 0.9rem 0 0;
        color: #748078;
        font-size: 0.72rem;
        line-height: 1.5;
        text-align: center;
      }

      .switch-auth {
        margin-top: 0.6rem;
        font-size: 0.8rem;
      }

      .switch-auth a {
        color: #426836;
        font-weight: 700;
      }

      @media (max-width: 520px) {
        .auth-screen {
          padding: 1rem;
        }

        .auth-card {
          padding: 1.4rem;
        }
      }
    `
  ]
})
export class SignupComponent {
  readonly selectedType = signal<AccountType>('creator');
  readonly nameInput = signal('');
  readonly emailInput = signal('');
  readonly passwordInput = signal('');
  readonly errorMessage = signal('');

  constructor(private readonly router: Router, private readonly session: SessionService) {}

  createAccount(): void {
    const name = this.nameInput().trim();
    const email = this.emailInput().trim().toLowerCase();
    const password = this.passwordInput();

    if (!name || !email || password.length < 8) {
      this.errorMessage.set('Enter your name, a valid email address, and a password with at least 8 characters.');
      return;
    }

    this.errorMessage.set('');
    this.session.signIn({ type: this.selectedType(), name, email });
    void this.router.navigateByUrl(this.selectedType() === 'creator' ? '/creator' : '/company');
  }
}
