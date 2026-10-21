import { SessionService } from './session.service';

describe('SessionService', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('persists the signed-in account for the browser session and clears it on sign out', () => {
    const session = new SessionService();
    const user = { type: 'creator' as const, name: 'Maya Chen', email: 'creator@sponsr.com' };

    session.signIn(user);

    expect(session.currentUser()).toEqual(user);
    expect(JSON.parse(sessionStorage.getItem('sponsr-session') ?? 'null')).toEqual(user);

    session.signOut();

    expect(session.currentUser()).toBeNull();
    expect(sessionStorage.getItem('sponsr-session')).toBeNull();
  });

  it('ignores malformed saved sessions', () => {
    sessionStorage.setItem('sponsr-session', '{not valid json');

    const session = new SessionService();

    expect(session.currentUser()).toBeNull();
    expect(sessionStorage.getItem('sponsr-session')).toBeNull();
  });
});
