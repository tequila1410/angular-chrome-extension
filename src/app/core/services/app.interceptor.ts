import {Injectable} from "@angular/core";
import {HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {catchError, map} from "rxjs/operators";
import {throwError} from "rxjs";
import {Store} from "@ngrx/store";
import {AppState} from "../store/app.reducer";
import {signOut} from "../store/user/user.actions";

@Injectable()
export class RequestInterceptorService implements HttpInterceptor {

  constructor(private store: Store<AppState>) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    if (req.url.includes('zoog_api')) {
      req = req.clone({url: req.url.replace('zoog_api', `${environment.zoogApiUrl}`)});
    }

    return next.handle(this.addToken(req))
      .pipe(
        map(response => {

          if (response instanceof HttpResponse) {
            const newToken = response.headers.get('Authorization')?.split('Bearer ')[1];
            if (newToken)
              localStorage.setItem('token', newToken)
          }
          return response
        }),
        catchError(error => {
          if (error instanceof HttpErrorResponse) {
            switch ((<HttpErrorResponse>error).status) {
              case 401:
                return this.handle401Error(error);
              case 422:
                return this.handle422Error(error)
              default:
                return throwError(error)
            }
          } else {
            return throwError(error);
          }
        })
      );
  }

  private addToken(req: HttpRequest<any>): HttpRequest<any> {

    const token = localStorage.getItem('token');

    return req.clone({setHeaders: {Authorization: 'Bearer ' + token}});
  }

  private handle401Error(error: HttpErrorResponse) {
    this.store.dispatch(signOut());
    return throwError(error)
  }

  private handle422Error(error: HttpErrorResponse) {
    // this.snackBar.open(error.error.message, 'Close', {duration: 5000, panelClass: ['snack-bar-error']});
    return throwError(error);
  }
}
