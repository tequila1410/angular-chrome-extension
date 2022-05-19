import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ProxyModel } from "src/app/auth/models/proxy.model";

@Injectable({
  providedIn: "root"
})
export class PassPopupService {

  private passPopupSubject = new Subject<any>();

  public passPopupState = this.passPopupSubject.asObservable();

  constructor() {
  }

  show(text: string, login: string | null, userCred: string, selectedServer: ProxyModel): void {
    this.passPopupSubject.next({
      show: true,
      text: text,
      log: login,
      userCred: userCred,
      selectedServer: selectedServer
    });
  }
}