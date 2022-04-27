import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {User} from "./core/models/user.model";
import {connectingSuccess, setServers} from "./core/store/vpn/vpn.actions";
import {Store} from "@ngrx/store";
import {AppState} from "./core/store/app.reducer";
import {getCookie, getProxy} from "./core/utils/chrome-backgroud";
import {authenticateSuccess} from "./core/store/user/user.actions";
import { getFingerPrint } from './core/utils/fingerprint';
import { ServerApi } from './core/api/server.api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  /**
   * Current user data
   * @type {Observable<User>}
   */
  user!: Observable<User | null>;

  constructor(private router: Router,
              private store: Store<AppState>,
              private api: ServerApi) {
    this.authenticateUserHandler();

    getProxy().then((proxy) => {
      if (proxy) {
        this.store.dispatch(connectingSuccess(proxy));
      }
    });
    this.store.dispatch(setServers());
  }

  private authenticateUserHandler(): void {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
      this.store.dispatch(authenticateSuccess({token, user: JSON.parse(user)}))
    } else {
      getCookie('userCookie', 'https://dev-ng.zoogvpn.com')
        .then((cookie) => {
          const userCookie = JSON.parse(cookie.value);
          this.store.dispatch(authenticateSuccess({token: userCookie.token, user: userCookie.user}));
        })
        .catch(reason => {
          console.warn(reason);
        })
    }
  }
}
