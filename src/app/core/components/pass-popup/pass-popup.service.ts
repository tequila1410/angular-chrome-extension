import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {ProxyModel} from "src/app/auth/models/proxy.model";

@Injectable({
  providedIn: "root"
})
export class PassPopupService {

  /**
   * Subject for creating popup
   * @type {Subject<any>}
   */
  private passPopupSubject: Subject<any> = new Subject<any>();

  /**
   * @type {Observable<any>}
   * Exported state of created popup
   */
  public passPopupState: Observable<any> = this.passPopupSubject.asObservable();

  /**
   * Constructor for PassPopupService
   */
  constructor() {
  }

  /**
   * Shows popup
   * @param {string} text
   * @param {string | null} login
   * @param {string} userCred
   * @param {ProxyModel} selectedServer
   * @return {void}
   */
  show(text: string, login: string | null, userCred: string, selectedServer: ProxyModel): void {
    this.passPopupSubject.next({
      show: true,
      text: text,
      login: login,
      userCred: userCred,
      selectedServer: selectedServer
    });
  }
}