import { Component, OnInit } from '@angular/core';
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

  form: FormGroup;

  constructor(private store: Store<AppState>,
              private recaptchaV3Service: ReCaptchaV3Service) {
    this.form = new FormGroup({
      email: new FormControl(''),
      password: new FormControl('')
    })
  }

  ngOnInit(): void {
  }

  loginUser() {
    this.recaptchaV3Service.execute('signInAction')
      .pipe(
        take(1),
        tap(token => {
          const {email, password} = this.form.value;
          this.store.dispatch(authenticate({email, password, token}));
        }),
        catchError((err, caught) => {
          this.form.enable();
          return caught;
        })
      )
      .subscribe();
  }

  loginByFingerPrint() {
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
