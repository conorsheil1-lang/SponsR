import { Injectable, signal } from '@angular/core';

export type AccountType = 'creator' | 'company';

export interface SignedInUser {
  accountId?: string;
  type: AccountType;
  name: string;
  email: string;
}

const SESSION_STORAGE_KEY = 'sponsr-session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly currentUser = signal<SignedInUser | null>(this.readStoredUser());

  signIn(user: SignedInUser): void {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  signOut(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    this.currentUser.set(null);
  }

  private readStoredUser(): SignedInUser | null {
    const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedSession) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(storedSession);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'type' in parsed &&
        (parsed.type === 'creator' || parsed.type === 'company') &&
        'name' in parsed &&
        typeof parsed.name === 'string' &&
        'email' in parsed &&
        typeof parsed.email === 'string' &&
        (!('accountId' in parsed) || typeof parsed.accountId === 'string')
      ) {
        const accountId = 'accountId' in parsed ? parsed.accountId : undefined;
        return {
          ...(typeof accountId === 'string' ? { accountId } : {}),
          type: parsed.type,
          name: parsed.name,
          email: parsed.email
        };
      }
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }

    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}
