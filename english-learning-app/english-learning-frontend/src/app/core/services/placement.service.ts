import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlacementService {
  private taken: boolean | null = null;

  constructor(private authService: AuthService) {}

  check(): Observable<boolean> {
    if (this.taken !== null) {
      return of(this.taken);
    }
    return this.authService.getMe().pipe(
      map(res => !!(res?.success && res.data && (res.data as any).placementTaken)),
      tap(done => { this.taken = done; }),
      catchError(() => {
        this.taken = null;
        return of(false);
      })
    );
  }

  markDone(): void {
    this.taken = true;
  }

  reset(): void {
    this.taken = null;
  }
}
