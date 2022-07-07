import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {SubscriptionData, User} from "../../core/models/user.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthApi {

  /**
   * Constructor for AuthApi service
   * @param {HttpClient} httpClient
   */
  constructor(private httpClient: HttpClient) {
  }

  /**
   * User login
   * @param {string} email 
   * @param {string} password 
   * @param {string} token 
   * @return {Observable<{data: {token: string, user: User}}>}
   */
  userLogin(email: string, password: string, token?: string): Observable<{data: {token: string, user: User}}> {
    const postData: any = {
      email,
      password
    };

    if (token)
      postData["g-recaptcha-response"] = token;

    return this.httpClient.post<{data: {token: string, user: User}}>(`zoog_api/api/users/login`, postData);
  }

  /**
   * Register useer by fingerprint
   * @param {string} email
   * @param {string} name
   * @param {string} password
   * @param {string} passwordConfirmation
   * @param {string} token
   * @param {boolean} disableEmail
   * @return {Observable<{data: {id: number, token: string, email: string, firstName: string, secondName: string,
   *                             subscriptionData: SubscriptionData, verified: number}}>}
   */
  registerByFingerPrint(
    email: string, name: string,
    password: string, passwordConfirmation: string,
    token: string, disableEmail: boolean
  ): Observable<{data: {id: number, token: string, email: string, firstName: string, secondName: string,
                        subscriptionData: SubscriptionData, verified: number}}> {
    const postData: any = {
      email,
      password,
      password_confirmation: passwordConfirmation,
      name,
      disableEmail,
      token
    };

    return this.httpClient.post<{data: {id: number, token: string, email: string, firstName: string, secondName: string,
        subscriptionData: SubscriptionData, verified: number}}>(`zoog_api/api/users/registerByExtension`, postData)
  }

}
