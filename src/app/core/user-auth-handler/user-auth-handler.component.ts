import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {User} from '../models/user.model';
import {AppState} from '../store/app.reducer';
import {getCookie, getProxy} from '../utils/chrome-backgroud';
import {connectingSuccess, setServers} from '../store/vpn/vpn.actions';
import {authenticateSuccess, signUpFP} from '../store/user/user.actions';
import {getFingerPrint} from '../utils/fingerprint';
import {ReCaptchaV3Service} from 'ng-recaptcha';
import { catchError, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-user-auth-handler',
  templateUrl: './user-auth-handler.component.html',
  styleUrls: ['./user-auth-handler.component.scss']
})
export class AuthUserHandlerComponent {

  /**
   * Current user data
   * @type {Observable<User>}
   */
  user!: Observable<User | null>;

  constructor(private router: Router,
              private store: Store<AppState>,
              private recaptchaV3Service: ReCaptchaV3Service) {
    this.authenticateUserHandler();
  }

  private authenticateUserHandler(): void {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
      this.store.dispatch(authenticateSuccess({token, user: JSON.parse(user)}))
      this.getProxyAfterAuth();
    } else {
      getCookie('userCookie', 'https://dev-ng.zoogvpn.com')
        .then((cookie) => {
          const userCookie = JSON.parse(cookie.value);
          this.store.dispatch(authenticateSuccess({token: userCookie.token, user: userCookie.user}));
          this.getProxyAfterAuth();
        })
        .catch(reason => {
          console.warn(reason);
          getFingerPrint().then(fingerprint => this.signUpFP(fingerprint));
          this.getProxyAfterAuth();
        })
    }
  }

  private signUpFP(fingerprint: string): void {
    this.recaptchaV3Service.execute('signInAction')
      .pipe(
        take(1),
        tap(token => {
          this.store.dispatch(signUpFP({fingerprint, token}));
        }),
        catchError((err) => {
          return err;
        })
      )
      .subscribe();
  }

  private getProxyAfterAuth(): void {
    getProxy().then((proxy) => {
      if (proxy) {
        this.store.dispatch(connectingSuccess(proxy));
      }
    });
    this.store.dispatch(setServers());
  }

  
}