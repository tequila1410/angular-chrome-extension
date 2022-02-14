import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {Store} from "@ngrx/store";
import {AppState} from "../../../core/store/app.reducer";
import {authenticate} from "../../../core/store/user/user.actions";
import {ReCaptchaV3Service} from "ng-recaptcha";
import {catchError, take, tap} from "rxjs/operators";

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

    console.log(this.recaptchaV3Service);
    this.recaptchaV3Service.execute('signInAction')
      .pipe(
        take(1),
        tap(token => {
          // console.log(token);
          const {email, password} = this.form.value;
          this.store.dispatch(authenticate({email, password, token}));
        }),
        catchError((err) => {
          // console.log(err)
          this.form.enable();
          return err;
        })
      )
      .subscribe();


  }

  goToForgot() {


  }

}
