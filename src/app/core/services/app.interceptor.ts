import {Injectable} from "@angular/core";
import {
  HttpErrorResponse, HttpEvent,
  HttpHandler, HttpInterceptor,
  HttpRequest, HttpResponse
} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {catchError, map} from "rxjs/operators";
import {Observable, throwError} from "rxjs";
import {Store} from "@ngrx/store";
import {AppState} from "../store/app.reducer";
import {signOut} from "../store/user/user.actions";

@Injectable()
export class RequestInterceptorService implements HttpInterceptor {

  /**
   * Constructor for RequestInterceptorService
   * @param {Store<AppState>} store
   */
  constructor(private store: Store<AppState>) {
  }

  /**
   * Intercepts & handle Http events
   * @param {HttpRequest<any>} req 
   * @param {HttpHandler} next 
   * @return {Observable<HttpEvent<any>>}
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
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

  /**
   * Adds bearer token
   * @param {HttpRequest<any>} req
   * @return {HttpRequest<any>}
   */
  private addToken(req: HttpRequest<any>): HttpRequest<any> {
    const token = localStorage.getItem('token');

    return req.clone({setHeaders: {Authorization: 'Bearer ' + token}});
  }

  /**
   * Handle 401 type error
   * @param {HttpErrorResponse} error
   * @return {Observable<never>}
   */
  private handle401Error(error: HttpErrorResponse): Observable<never> {
    this.store.dispatch(signOut());
    return throwError(error)
  }

  /**
   * Handle 422 type error
   * @param {HttpErrorResponse} error
   * @return {Observable<never>}
   */
  private handle422Error(error: HttpErrorResponse): Observable<never> {
    return throwError(error);
  }
}
