import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
  authenticate,
  authenticateError,
  authenticateSuccess,
  signOut, signOutSuccess,
} from "./user.actions";
import {catchError, exhaustMap, map} from "rxjs/operators";
import {of} from "rxjs";
import {User} from "../../models/user.model";
import {AuthApi} from "../../../auth/api/auth.api";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {AppState} from "../app.reducer";
import { SnackbarService } from "../../snackbar/snackbar.service";
import { Respose } from "../../models/response.model";
import { bestServerSelect } from "../vpn/vpn.actions";

@Injectable()
export class UserEffects {

  private clearLocalStorage(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('tariffName');
    localStorage.removeItem('vrfshwn');
    localStorage.removeItem('isBestServerSelected');
    localStorage.removeItem('recentlyUsed');
  }

  private setUserToLocalStorage(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authenticate),
      exhaustMap((actions) => {
        return this.authApi.userLogin(actions.email, actions.password, actions.token)
          .pipe(
            map(userData => {
              // update user "limits"
              // maybe routing somewhere

              this.setUserToLocalStorage(userData.data.token, userData.data.user);
              this.store.dispatch(bestServerSelect({ bestServerSelected: true }));
              this.router.navigate(['/dashboard'])
              return authenticateSuccess({...userData.data});
            }),
            catchError((error) => {
              this.showSnackBar(error.error);
              return of(authenticateError(error));
            })
          )
      })
    )
  );

  logOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(signOut),
      map(() => {
        // update client limits
        // maybe routing somewhere
        this.clearLocalStorage();
        this.router.navigate(['/auth']);
        return signOutSuccess();
      })
    )
  )

  // signUp$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(signUp),
  //     exhaustMap(actions => {
  //         const referralID = localStorage.getItem('referralID') || undefined;
  //         const friendID = localStorage.getItem('friendID') || undefined;
  //         const gaCid = this.gaService.getGaCid();
  //
  //         return this.authApi.userRegister(actions.name || undefined, actions.email, actions.password,
  //           actions.password_confirmation, actions.token, gaCid, referralID, friendID)
  //           .pipe(
  //             map(userData => {
  //               // update user limits
  //               localStorage.removeItem('referralID');
  //               localStorage.removeItem('friendID');
  //               this.router.navigate(['/plans']);
  //               this.setUserToLocalStorage(userData.data.token, userData.data.user);
  //               return signUpSuccess({...userData.data});
  //             }),
  //             catchError(error => {
  //               this.showSnackBarError(transformHttpError(error.error.errors));
  //               return of(signUpError(error));
  //             })
  //           )
  //       }
  //     )
  //   )
  // );

  constructor(
    private actions$: Actions,
    private authApi: AuthApi,
    private router: Router,
    private store: Store<AppState>,
    private snackbarService: SnackbarService
  ) {
  }

  private showSnackBar(responseContent: Respose) {
    this.snackbarService.show(responseContent);
  }
}
