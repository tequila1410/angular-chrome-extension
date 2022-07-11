import {User} from "./user.model";

export interface Respose {
  errors?: {
    email?: string[], 
    password?: string[]
  }
  message: string,
  status_code?: number,
  token?: string,
  user?: User
}