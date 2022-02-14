import {Injectable} from "@angular/core";
import { Subject } from "rxjs";
import { Respose } from "../models/response.model";

@Injectable({
  providedIn: "root"
})
export class SnackbarService {

  private snackbarSubject = new Subject<any>();

  public snackbarState = this.snackbarSubject.asObservable();

  constructor() {
  }

  show(responseContent: Respose) {

    this.snackbarSubject.next({
      show: true,
      responseContent,
    });
  }
}