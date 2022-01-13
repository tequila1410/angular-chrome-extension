import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {User} from "../../core/models/user.model";

@Injectable({
  providedIn: 'root'
})
export class AuthApi {

  private API_URL: string = 'https://dev-api.zoogvpn.com';

  constructor(private httpClient: HttpClient) {
  }

  userLogin(email: string, password: string, token?: string) {
    const postData = {
      email,
      password
    };

    return this.httpClient.post<{data: {token: string, user: User}}>(`${this.API_URL}/api/users/login`, postData);
  }

}
