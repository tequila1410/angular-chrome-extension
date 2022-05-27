import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
  authenticate,
  authenticateError,
  authenticateSuccess, signInFPError,
  signOut, signOutSuccess, signUpFP, signUpFPSuccess,
} from "./user.actions";
import {catchError, exhaustMap, map, mergeMap, tap} from "rxjs/operators";
import {User} from "../../models/user.model";
import {AuthApi} from "../../../auth/api/auth.api";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {AppState} from "../app.reducer";
import { SnackbarService } from "../../components/snackbar/snackbar.service";
import { Respose } from "../../models/response.model";
import {
  checkListener,
  clearProxy,
  handlerBehaviorChanged,
  removeOnAuthRequiredHandler
} from "../../utils/chrome-backgroud";
import { MockDataApi } from "../../api/mock-data.api";
import {UserCred} from "../../models/user-cred.enum";
import {ReCaptchaV3Service} from "ng-recaptcha";
import {setServers} from "../vpn/vpn.actions";

@Injectable()
export class UserEffects {

  actionTmp!: {token: string, fingerprint: string};

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
        map(() => {
          // update client limits
          // maybe routing somewhere
          clearProxy();
          checkListener();
          removeOnAuthRequiredHandler();
          handlerBehaviorChanged();
          checkListener();
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

        return this.authApi.userLogin(login, pass, actions.token);
      }),
      map(response => {
        this.router.navigate(['/dashboard']);
        this.setUserToLocalStorage(response.data.token, response.data.user);

        return authenticateSuccess({...response.data})
      }),
      catchError((error, caught) => {
        signInFPError({fingerprint: this.actionTmp.fingerprint});
        return caught;
      })
    )
  )

  signInFPError$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(signInFPError),
      mergeMap((actions) => {
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
      }),
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
        return signUpFPSuccess({...responseNew.data})
      }),
      catchError((error, caught) => {
        authenticateError(error);
        return caught;
      })
    )
  })

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
