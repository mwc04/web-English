import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { PlacementService } from '../services/placement.service';

export const placementGuard: CanActivateFn = (route, state) => {
  if (!localStorage.getItem('token')) return true;
  const router = inject(Router);
  const placement = inject(PlacementService);
  return placement.check().pipe(
    map(done => {
      if (done) return true;
      router.navigate(['/placement-test'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};
