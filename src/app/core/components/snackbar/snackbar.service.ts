import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {Respose} from "../../models/response.model";

@Injectable({
  providedIn: "root"
})
export class SnackbarService {
  
  /**
   * Subject for creating snackbar
   * @type {Subject<any>}
   */
  private snackbarSubject: Subject<any> = new Subject<any>();
  
  /**
   * Exported state of created snackbar
   * @type {Observable<any>}
   */
  public snackbarState: Observable<any> = this.snackbarSubject.asObservable();
  
  /**
   * Constructor for SnackbarService
   */
  constructor() {
  }

  /**
   * Shows snackbar
   * @param {Respose} responseContent
   * @return {void}
   */
  show(responseContent: Respose): void {
    this.snackbarSubject.next({
      show: true,
      responseContent,
    });
  }
}