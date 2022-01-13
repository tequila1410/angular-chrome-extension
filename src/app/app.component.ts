import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {User} from "./core/models/user.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-chrome-extension';

  public color: string = '#fc7f03';
  user!: Observable<User | null>;

  constructor(private router: Router) {
  }

  public colorize() {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      console.log('work')
      chrome.tabs.executeScript(
        tabs[0].id!,
        {code: `document.body.style.backgroundColor = '${this.color}'`}
      )
    })
  }
}
