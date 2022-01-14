import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import { Observable } from 'rxjs';
import {Store} from "@ngrx/store";
import {AppState} from "../../core/store/app.reducer";
import {isUserAuthenticated} from "../../core/store/user/user.selector";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private store: Store<AppState>,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.store.select(isUserAuthenticated)
      .pipe(tap(isAuth => {
        if (!isAuth)
          this.router.navigate(['auth']);
      }));
  }

}
