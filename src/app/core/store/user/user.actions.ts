import {createAction, props} from '@ngrx/store';
import {User} from "../../models/user.model";
import {LoginForm} from "../../../auth/models/login-form.model";

export const authenticate = createAction(
  '[User authenticate]',
  props<LoginForm>()
);

export const authenticateSuccess = createAction(
  '[User authenticate success]',
  props<{token: string, user: User}>()
);

export const authenticateError = createAction(
  '[User authenticate error]',
  props<{message: string}>()
);

export const signOut = createAction(
  '[User sign out]'
);

export const signOutSuccess = createAction(
  '[User sign out success]'
);

export const signOutError = createAction(
  '[User sign out error]'
);

export const signUpFP = createAction(
  '[User sign up]',
  props<{fingerprint: string, token: string}>()
);

export const signUpFPSuccess = createAction(
  '[User sign up success]',
  props<{token: string, user: User}>()
);

export const signInFPError = createAction(
  '[User sign in error]',
  props<{fingerprint: string}>()
);