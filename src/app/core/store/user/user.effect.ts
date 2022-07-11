import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
  authenticate,
  authenticateError,
  authenticateSuccess, signInFPError,
  signOut, signOutSuccess, signUpFP
} from "./user.actions";
import {catchError, exhaustMap, map, mergeMap, withLatestFrom} from "rxjs/operators";
import {User} from "../../models/user.model";
import {AuthApi} from "../../../auth/api/auth.api";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {AppState} from "../app.reducer";
import {SnackbarService} from "../../components/snackbar/snackbar.service";
import {Respose} from "../../models/response.model";
import {UserCred} from "../../models/user-cred.enum";
import {ReCaptchaV3Service} from "ng-recaptcha";
import {closeConnection, setServers} from "../vpn/vpn.actions";
import {of} from "rxjs";
import {clearProxyCookie} from "../../utils/chrome-backgroud";

@Injectable()
export class UserEffects {

  actionTmp!: {token: string, fingerprint: string};

  private clearLocalStorage(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('tariffName');
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
      }),
      map(userData => {
        return authenticateSuccess({...userData.data});
      }),
      catchError((error, caught) => {
        this.showSnackBar(error.error);
        authenticateError(error);
        return caught;
      })
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authenticateSuccess),
      map(userData => {
        this.setUserToLocalStorage(userData.token, userData.user);
        this.setUserCredsToLocalStorage(userData.user.email);
        this.router.navigate(['/dashboard']);
        return setServers();
      })
    )
  );

  logOut$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(signOut),
        withLatestFrom(this.store),
        map(([data, storeState]) => {
          storeState.vpn.serverList.forEach(server => {
            clearProxyCookie(server.host);
          });

          this.store.dispatch(closeConnection());
          this.clearLocalStorage();
          this.router.navigate(['/auth']);
          return signOutSuccess();
        })
      )
    }
  )

  signUpFP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(signUpFP),
      exhaustMap(actions => {
        this.actionTmp = actions;
        const login = `ext_${actions.fingerprint}@zoogvpn.com`;
        const pass = actions.fingerprint;

        return this.authApi.userLogin(login, pass, actions.token)
          .pipe(
            map(response => {
              this.router.navigate(['/dashboard']);
              this.setUserToLocalStorage(response.data.token, response.data.user);
              this.setUserCredsToLocalStorage(response.data.user.email, this.actionTmp.fingerprint);

              return authenticateSuccess({...response.data})
            }),
            catchError((error, caught) => {

              return of(signInFPError({fingerprint: this.actionTmp.fingerprint}))
            })
          );
      })
    )
  )

  signInFPError$ = createEffect(() => {

    let login, pass;
    return this.actions$.pipe(
      ofType(signInFPError),
      mergeMap((actions) => {
        login = `ext_${actions.fingerprint}@zoogvpn.com`;
        pass = actions.fingerprint;

        return this.recaptchaV3Service.execute('signUpFPAction').pipe(map(token => ({actions, token})));
      }),
      mergeMap(data => {
        const userRegisterData = {
          email: `ext_${data.actions.fingerprint}@zoogvpn.com`,
          name: data.actions.fingerprint,
          password: data.actions.fingerprint,
          passwordConfirmation: data.actions.fingerprint,
          token: data.token,
          disableEmail: true
        }

        return this.authApi.registerByFingerPrint(userRegisterData.email, userRegisterData.name, userRegisterData.password,
          userRegisterData.passwordConfirmation, userRegisterData.token, userRegisterData.disableEmail)
          .pipe(
            map(response => {
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
              this.setUserCredsToLocalStorage(responseNew.data.user.email, this.actionTmp.fingerprint);
              return authenticateSuccess({...responseNew.data})
            }),
            catchError((error, caught) => {
              return of(authenticateError(error));
            })
          )
      })
    )
  })

  constructor(
    private actions$: Actions,
    private authApi: AuthApi,
    private router: Router,
    private store: Store<AppState>,
    private snackbarService: SnackbarService,
    private recaptchaV3Service: ReCaptchaV3Service
  ) {
  }

  private showSnackBar(responseContent: Respose) {
    this.snackbarService.show(responseContent);
  }
}
