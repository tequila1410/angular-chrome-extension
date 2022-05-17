import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
  authenticate,
  authenticateError,
  authenticateSuccess,
  signOut, signOutSuccess, signUpFP, signUpFPError, signUpFPSuccess,
} from "./user.actions";
import {catchError, exhaustMap, map, mergeMap, tap} from "rxjs/operators";
import {of} from "rxjs";
import {User} from "../../models/user.model";
import {AuthApi} from "../../../auth/api/auth.api";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {AppState} from "../app.reducer";
import { SnackbarService } from "../../components/snackbar/snackbar.service";
import { Respose } from "../../models/response.model";
import {clearProxy} from "../../utils/chrome-backgroud";
import { MockDataApi } from "../../api/mock-data.api";
import {UserCred} from "../../models/user-cred.enum";
import {ReCaptchaV3Service} from "ng-recaptcha";

@Injectable()
export class UserEffects {

  private clearLocalStorage(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('tariffName');
    localStorage.removeItem('vrfshwn');
    localStorage.removeItem('isBestServerSelected');
    localStorage.removeItem('recentlyUsed');
    localStorage.removeItem(UserCred.userLogin);
    localStorage.removeItem(UserCred.userPassword);
  }

  private setUserToLocalStorage(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private setUserCredsToLocalStorage(login: string, password?: string): void {
    localStorage.setItem(UserCred.userLogin, login);
    if (password)
      localStorage.setItem(UserCred.userPassword, password);
  }

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authenticate),
      exhaustMap((actions) => {
        this.setUserCredsToLocalStorage(actions.email, actions.password);
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
        this.setUserCredsToLocalStorage(userData.user.email);
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

  signUpFP$ = createEffect(() => {
    let actionTmp: {token: string, fingerprint: string};
    return this.actions$.pipe(
      ofType(signUpFP),
      exhaustMap(actions => {
        actionTmp = actions;
        this.setUserCredsToLocalStorage(`ext_${actions.fingerprint}@zoogvpn.com`, actions.fingerprint);
        const userRegisterData = {
          email: `ext_${actions.fingerprint}@zoogvpn.com`,
          name: actions.fingerprint,
          password: actions.fingerprint,
          passwordConfirmation: actions.fingerprint,
          token: actions.token,
          disableEmail: true
        }
        console.log('let register fp')
        return this.authApi.registerByFingerPrint(userRegisterData.email, userRegisterData.name, userRegisterData.password,
          userRegisterData.passwordConfirmation, userRegisterData.token, userRegisterData.disableEmail)
      }),
      map(response => {
        this.router.navigate(['/dashboard']);
        const responseNew = {
          data: {
            token: response.data.token,
            user: {
              accountStatus: '',
              email: response.data.email,
              firstName: response.data.firstName,
              id: response.data.id,
              secondName: response.data.secondName,
              subscriptionData: response.data.subscriptionData,
              verified: response.data.verified
            }
          }
        }

        this.setUserToLocalStorage(responseNew.data.token, responseNew.data.user);
        return signUpFPSuccess({...responseNew.data})
      }),
      catchError(error => {
        // console.log(error);
        // this.router.navigate(['/auth'])
        return of(signUpFPError({fingerprint: actionTmp.fingerprint}));
      })
    )
  })

  signUpFPError$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(signUpFPError),
      exhaustMap((actions) => {
        console.log('let generate captcha 2')
        return this.recaptchaV3Service.execute('signUpFPAction').pipe(map(token => ({actions, token})));
        // return of({actions, token: 'dev'})
      }),
      exhaustMap(data => {
        const login = `ext_${data.actions.fingerprint}@zoogvpn.com`;
        const pass = data.actions.fingerprint;
        return this.authApi.userLogin(login, pass, data.token);
      }),
      map(response => {
        console.log('that good')
        return authenticateSuccess({...response.data});
      }),
      catchError(error => {
        console.log('mb captcha error: ', error)
        return of(authenticateError(error))
      })
    )
  })

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
    private mockDataApi: MockDataApi,
    private recaptchaV3Service: ReCaptchaV3Service
  ) {
  }

  private showSnackBar(responseContent: Respose) {
    this.snackbarService.show(responseContent);
  }
}
