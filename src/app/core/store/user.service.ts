import { Injectable } from '@angular/core';
import {User} from "../models/user.model";
import {Observable, of, Subject} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {Router} from "@angular/router";
import {AuthApi} from "../../auth/api/auth.api";

interface UserState {
  isAuthenticated: boolean
  user: User | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userState: Subject<UserState> = new Subject<UserState>();

  constructor(private router: Router,
              private authApi: AuthApi) {
    this.userState.next({
      isAuthenticated: false,
      user: null
    });

    const user = JSON.parse(localStorage.getItem('user') || '0');

    if (user) {
      this.userState.next({
        isAuthenticated: true,
        user
      });
      this.router.navigate(['/dashboard']);
    } else {
      console.log('-');
      this.router.navigate(['auth/sign-in']);
    }
  }

  public getUser(): Observable<User | null> {
    return this.userState.pipe(
      map(data => data?.user)
    )
  }

  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userState.next({
      isAuthenticated: true,
      user
    })
  }

  public userLogin(email: string, password: string) {
    this.authApi.userLogin(email, password)
      .pipe(
        map(response => {
          this.setUser(response.data.user);
          this.router.navigate(['/dashboard'])
          return response;
        }),
        catchError(error => {
          console.log(error);
          return error;
        })
      ).subscribe();
  }
}
