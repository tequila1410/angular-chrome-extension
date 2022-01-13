import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
  authenticate,
  authenticateError,
  authenticateSuccess,
  signOut, signOutSuccess,
  signUp,
  signUpError,
  signUpSuccess,
  // sendNewPassAction,
  sendNewPassActionSuccess,
  sendNewPassActionError,
  verifyUserAction,
  verifyUserActionSuccess,
  verifyUserActionError, updateUserData, updateUserDataSuccess
} from "./user.actions";
import {catchError, exhaustMap, map, takeUntil} from "rxjs/operators";
import {of} from "rxjs";
import {User} from "../../models/user.model";
import {AuthApi} from "../../../auth/api/auth.api";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {transformHttpError} from "../../utils/util";
import {AppState} from "../app.reducer";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable()
export class UserEffects {

  private clearLocalStorage(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('tariffName');
    localStorage.removeItem('vrfshwn');
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

              this.router.navigate(['/dashboard'])
              return authenticateSuccess({...userData.data});
            }),
            catchError((error) => {
              this.showSnackBarError(error.error.message);
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
    private _snackBar: MatSnackBar,
    private store: Store<AppState>,
  ) {
  }

  private showSnackBarError(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 2000,
      panelClass: ['snack-bar-error']
    });
  }
}
