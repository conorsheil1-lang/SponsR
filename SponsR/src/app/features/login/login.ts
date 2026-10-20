import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type AccountType = 'creator' | 'company';

type MockUser = {
  email: string;
  password: string;
  type: AccountType;
  name: string;
};

const MOCK_USERS: MockUser[] = [
  { email: 'creator@sponsr.com', password: 'password', type: 'creator', name: 'Maya Chen' },
  { email: 'company@sponsr.com', password: 'password', type: 'company', name: 'Northstar Labs' }
];

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="auth-screen">
      <section class="auth-card">
        <div class="brand-row">
          <div class="brand-mark">S</div>
          <span>SponsR</span>
        </div>

        <div class="intro">
          <p class="eyebrow">Welcome back</p>
          <h1>Sign in to your portal</h1>
        </div>

        <div class="account-picker" aria-label="Account type selector">
          <button
            type="button"
            [class.active]="selectedType() === 'creator'"
            (click)="selectedType.set('creator')"
          >
            Creator
          </button>
          <button
            type="button"
            [class.active]="selectedType() === 'company'"
            (click)="selectedType.set('company')"
          >
            Company
          </button>
        </div>

        <form class="login-form" (ngSubmit)="continueToPortal()">
          <label>
            <span>Work email</span>
            <input type="email" name="email" [(ngModel)]="emailInput" placeholder="you@company.com" />
          </label>

          <label>
            <span>Password</span>
            <input type="password" name="password" [(ngModel)]="passwordInput" placeholder="••••••••" />
          </label>

          @if (errorMessage()) {
            <p class="error-message">{{ errorMessage() }}</p>
          }

          <button class="submit-button" type="submit">
            Continue as {{ selectedType() === 'creator' ? 'creator' : 'company' }}
          </button>
        </form>

        <div class="demo-box">
          <strong>Demo accounts</strong>
          <span>Creator: creator@sponsr.com / password</span>
          <span>Company: company@sponsr.com / password</span>
        </div>

        <p class="helper-text">
          {{ selectedType() === 'creator' ? 'Creators can browse campaigns, register interest, and manage their media kit.' : 'Companies can discover sponsorship candidates and start new campaigns.' }}
        </p>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .auth-screen {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: radial-gradient(circle at top, rgba(124, 58, 237, 0.25), transparent 40%), #07111f;
      }

      .auth-card {
        width: min(100%, 440px);
        background: rgba(15, 23, 42, 0.82);
        border: 1px solid rgba(148, 163, 184, 0.16);
        border-radius: 28px;
        padding: 2rem;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.5);
      }

      .brand-row {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }

      .brand-mark {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
      }

      .eyebrow {
        margin: 0 0 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.68rem;
        color: #7cc9ff;
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 2.5rem);
      }

      .intro {
        margin-bottom: 1.3rem;
      }

      .account-picker {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.6rem;
        margin-bottom: 1.4rem;
      }

      .account-picker button {
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(148, 163, 184, 0.06);
        color: #dfe7ff;
        border-radius: 12px;
        padding: 0.8rem 0.9rem;
        cursor: pointer;
        font-weight: 600;
      }

      .account-picker .active {
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(34, 211, 238, 0.2));
        border-color: rgba(124, 58, 237, 0.65);
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        color: #dfe7ff;
      }

      label span {
        font-size: 0.9rem;
      }

      input {
        border: 1px solid rgba(148, 163, 184, 0.16);
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.9);
        color: #edf4ff;
        padding: 0.85rem 0.9rem;
      }

      .submit-button {
        margin-top: 0.5rem;
        border: none;
        border-radius: 999px;
        padding: 0.9rem 1rem;
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
        color: white;
        font-weight: 700;
        cursor: pointer;
      }

      .demo-box {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-top: 1.1rem;
        padding: 0.8rem 0.9rem;
        background: rgba(148, 163, 184, 0.06);
        border: 1px solid rgba(148, 163, 184, 0.12);
        border-radius: 12px;
        color: #dfe7ff;
      }

      .demo-box strong {
        margin-bottom: 0.2rem;
      }

      .error-message {
        margin: 0;
        color: #ff9ca8;
        font-size: 0.9rem;
      }

      .helper-text {
        margin: 1rem 0 0;
        color: #9fb0d4;
        line-height: 1.5;
      }
    `
  ]
})
export class LoginComponent {
  readonly selectedType = signal<AccountType>('creator');
  readonly emailInput = signal('');
  readonly passwordInput = signal('');
  readonly errorMessage = signal('');

  constructor(private readonly router: Router) {}

  continueToPortal(): void {
    const matchedUser = MOCK_USERS.find(
      (user) =>
        user.email.toLowerCase() === this.emailInput().trim().toLowerCase() &&
        user.password === this.passwordInput() &&
        user.type === this.selectedType()
    );

    if (!matchedUser) {
      this.errorMessage.set('Invalid login. Use the demo account for your selected type and password: password');
      return;
    }

    this.errorMessage.set('');
    this.router.navigateByUrl(this.selectedType() === 'creator' ? '/creator' : '/company');
  }
}
