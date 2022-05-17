import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {SubscriptionData, User} from "../../core/models/user.model";

@Injectable({
  providedIn: 'root'
})
export class AuthApi {

  constructor(private httpClient: HttpClient) {
  }

  userLogin(email: string, password: string, token?: string) {
    const postData: any = {
      email,
      password
    };

    if (token)
      postData["g-recaptcha-response"] = token;

    return this.httpClient.post<{data: {token: string, user: User}}>(`zoog_api/api/users/login`, postData);
  }

  registerByFingerPrint(email: string, name: string, password: string, passwordConfirmation: string, token: string, disableEmail: boolean) {
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
