import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {isUserAuthenticated} from "../../core/store/user/user.selector";
import {map, tap} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {AppState} from "../../core/store/app.reducer";

@Injectable({
  providedIn: 'root'
})
export class OnlyGuestGuard implements CanActivate {

  constructor(private store: Store<AppState>,
              ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.store.select(isUserAuthenticated)
      .pipe(
        map(isAuth => !isAuth),
        tap(isAuth => {
          // if (!isAuth)
            // this.router.navigate(['auth']);
        })
      );
  }

}
