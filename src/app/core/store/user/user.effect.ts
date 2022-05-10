import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
  authenticate,
  authenticateError,
  authenticateSuccess,
  signOut, signOutSuccess, signUpFP, signUpFPError, signUpFPSuccess,
} from "./user.actions";
import {catchError, exhaustMap, map, tap} from "rxjs/operators";
import {of} from "rxjs";
import {User} from "../../models/user.model";
import {AuthApi} from "../../../auth/api/auth.api";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {AppState} from "../app.reducer";
import { SnackbarService } from "../../components/snackbar/snackbar.service";
import { Respose } from "../../models/response.model";
import { bestServerSelect } from "../vpn/vpn.actions";
import {clearProxy} from "../../utils/chrome-backgroud";
import { MockDataApi } from "../../api/mock-data.api";

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

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authenticateSuccess),
      tap(userData => {
        this.setUserToLocalStorage(userData.token, userData.user);
        this.router.navigate(['/dashboard']);
      })
    ), {dispatch: false}
  );

  logOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(signOut),
      map(() => {
        // update client limits
        // maybe routing somewhere
        clearProxy();
        this.clearLocalStorage();
        this.router.navigate(['/auth']);
        return signOutSuccess();
      })
    )
  )

  signUpFP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(signUpFP),
      exhaustMap(actions => {
        return this.mockDataApi.getTestUserData(actions.fingerprint, actions.token)
          .pipe(
            map(testUserData => {
              this.router.navigate(['/dashboard']);
              this.setUserToLocalStorage(testUserData.data.token, testUserData.data.user);
              return signUpFPSuccess({...testUserData.data})
            }),
            catchError(error => {
              console.log(error);
              this.router.navigate(['/auth'])
              return of(signUpFPError(error));
            })
          )
      })
    ))

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
    private snackbarService: SnackbarService,
    private mockDataApi: MockDataApi
  ) {
  }

  private showSnackBar(responseContent: Respose) {
    this.snackbarService.show(responseContent);
  }
}
