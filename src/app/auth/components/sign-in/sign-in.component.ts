import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {Store} from "@ngrx/store";
import {AppState} from "../../../core/store/app.reducer";
import {authenticate, signUpFP} from "../../../core/store/user/user.actions";
import {ReCaptchaV3Service} from "ng-recaptcha";
import {catchError, take, tap} from "rxjs/operators";
import {getFingerPrint} from "../../../core/utils/fingerprint";

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  /**
   * Form group for sign in inputs
   * @type {FormGroup}
   */
  signInForm: FormGroup;

  /**
   * Constructor for SignInComponent
   * @param {Store<AppState>} store 
   * @param {ReCaptchaV3Service} recaptchaV3Service 
   */
  constructor(private store: Store<AppState>, private recaptchaV3Service: ReCaptchaV3Service) {
    this.signInForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl('')
    })
  }

  /**
   * Call on component init
   * @return {void}
   */
  ngOnInit(): void {
  }

  /**
   * Function for standard user login
   * @return {void}
   */
  loginUser(): void {
    this.recaptchaV3Service.execute('signInAction')
      .pipe(
        take(1),
        tap(token => {
          const {email, password} = this.signInForm.value;
          this.store.dispatch(authenticate({email, password, token}));
        }),
        catchError((err, caught) => {
          this.signInForm.enable();
          return caught;
        })
      )
      .subscribe();
  }

  /**
   * Function for user login by fingerprint
   * @return {void}
   */
  loginByFingerPrint(): void {
    this.recaptchaV3Service.execute('signUpFPAction')
      .pipe(
        tap(token => {
          getFingerPrint().then(fingerprint => {
            this.store.dispatch(signUpFP({fingerprint, token}));
          });
        }),
        catchError((error, caught) => {
          return caught;
        })
      )
      .subscribe();
  }

}
