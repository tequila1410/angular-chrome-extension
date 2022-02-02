import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {User} from "./core/models/user.model";
import {connectingSuccess, setServers} from "./core/store/vpn/vpn.actions";
import {Store} from "@ngrx/store";
import {AppState} from "./core/store/app.reducer";
import {getProxy} from "./core/utils/chrome-backgroud";
import {ServerApi} from "./core/api/server.api";

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
    getProxy().then((proxy) => {
      if (proxy) {
        this.store.dispatch(connectingSuccess(proxy));
      }
    });
    this.store.dispatch(setServers())
  }
}
