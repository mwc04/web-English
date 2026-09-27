import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  if (token) return true;
  const router = inject(Router);
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
