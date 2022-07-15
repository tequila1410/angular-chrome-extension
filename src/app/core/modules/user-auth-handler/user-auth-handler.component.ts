import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {AppState} from '../../store/app.reducer';
import {getCookie} from '../../utils/chrome-backgroud';
import {authenticateSuccess, signUpFP} from '../../store/user/user.actions';
import {getFingerPrint} from '../../utils/fingerprint';
import {ReCaptchaV3Service} from 'ng-recaptcha';
import {catchError, tap} from 'rxjs/operators';
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-user-auth-handler',
  templateUrl: './user-auth-handler.component.html',
  styleUrls: ['./user-auth-handler.component.scss']
})
export class AuthUserHandlerComponent implements OnInit {

  readonly APP_URL: string = environment.zoogAppUrl;

  /**
   * Constructor for AuthUserHandlerComponent
   * @param {Router} router
   * @param {Store<AppState>} store
   * @param {ReCaptchaV3Service} recaptchaV3Service
   */
  constructor(
    private router: Router,
    private store: Store<AppState>,
    private recaptchaV3Service: ReCaptchaV3Service) {
  }

  /**
   * Call on component init
   * @return {void}
   */
  ngOnInit(): void {
    this.authenticateUserHandler();
  }

  /**
   * Handler for user authentication
   * @return {void}
   */
  private authenticateUserHandler(): void {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
      this.store.dispatch(authenticateSuccess({token, user: JSON.parse(user)}));
    } else {
      getCookie('userCookie', this.APP_URL)
        .then((cookie) => {
          const userCookie = JSON.parse(cookie.value);
          this.store.dispatch(authenticateSuccess({token: userCookie.token, user: userCookie.user}));
        })
        .catch(reason => {
          console.warn(reason);
          setTimeout(() => {
            getFingerPrint().then(fingerprint => {
              if (fingerprint === undefined || fingerprint === null) {
                this.router.navigate(['/auth']);
              } else {
                this.signUpFP(fingerprint);
              }
            }).catch(err => {
              this.router.navigate(['/auth']);
            });
          }, 2000);
        })
    }
  }

  /**
   * Function for sing up with fingerprint
   * @param {string} fingerprint 
   */
  private signUpFP(fingerprint: string): void {
    this.recaptchaV3Service.execute('signUpFPAction')
      .pipe(
        tap(token => {
          this.store.dispatch(signUpFP({fingerprint, token}));
        }),
        catchError((err) => {
          console.log('captcha error ', err)
          return err;
        })
      )
      .subscribe();
  }
}
