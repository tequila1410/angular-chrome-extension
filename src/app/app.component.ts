import {Component, OnDestroy} from '@angular/core';
import {Store} from "@ngrx/store";
import {AppState} from "./core/store/app.reducer";
import {closeConnection} from "./core/store/vpn/vpn.actions";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  constructor(private store: Store<AppState>) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'stopCheck') {
        this.store.dispatch(closeConnection());
      }
    })
  }

  ngOnDestroy() {

  }
}
