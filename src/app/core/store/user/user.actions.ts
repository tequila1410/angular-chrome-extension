import {createAction, props} from '@ngrx/store';
import {User} from "../../models/user.model";
import {LoginForm} from "../../../auth/models/login-form.model";

// for test
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

export const signOut = createAction('[User sign out]');

export const signOutSuccess = createAction('[User sign out success]');

export const signOutError = createAction('[User sign out error]');

export const signUpFP = createAction(
  '[User sign up]',
  props<{fingerprint: string, token: string}>()
  );

export const signUpFPSuccess = createAction(
  '[User sign up success]',
  props<{token: string, user: User}>()
);

export const signUpFPError = createAction(
  '[User sign up error]',
  props<{fingerprint: string}>()
);

// export const sendNewPassAction = createAction(
//   '[User send new password]',
//   props<{newPassData: ResetPass}>()
// );

export const sendNewPassActionSuccess = createAction(
  '[User send new password success]',
  props<{data: any}>()
);

export const sendNewPassActionError = createAction(
  '[User send new password error]',
  props<{message: string}>()
);

export const verifyUserAction = createAction(
  '[Verify user]',
  props<{userId: string, token: string}>()
)

export const verifyUserActionSuccess = createAction(
  '[Verify user success]',
  props<{data: any}>()
)

export const verifyUserActionError = createAction(
  '[Verify user error]',
  props<{data: any}>()
);

export const setUserSubscriptionStatus = createAction(
  '[Set user subscription status]',
  props<{status: string}>()
);

export const updateUserData = createAction(
  '[Update user data]'
);

export const updateUserDataSuccess = createAction(
  '[Update user data success]',
  props<{data: User}>()
);

export const setNewName = createAction(
  '[Update user name]',
  props<{firstName: string}>()
)
