import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountType, SessionService } from './session.service';

export const requireSession: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.currentUser() ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const requireAccountType: (type: AccountType) => CanActivateFn = (type) => () => {
  const session = inject(SessionService);
  const router = inject(Router);
  const user = session.currentUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  return user.type === type ? true : router.createUrlTree(['/overview']);
};
