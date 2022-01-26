import { Component, OnInit } from '@angular/core';
import {FormGroup} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthApi} from "../../api/auth.api";

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  form: FormGroup;

  constructor() {
    this.form = new FormGroup({})
  }

  ngOnInit(): void {
  }

  loginUser() {
    const testData = {
      email: 'vlad.zubko@rankactive.com',
      password: '123123'
    }
    // this.userStore.userLogin(testData.email, testData.password);
  }

  goToForgot() {

  }

}
