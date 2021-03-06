import {Action, createReducer, on} from "@ngrx/store";

import {User} from "../../models/user.model";
import {
  authenticate,
  authenticateError,
  authenticateSuccess,
  signOutSuccess,
  signUpFP,
  signUpFPSuccess,
  updateUserDataSuccess,
  signInFPError
} from "./user.actions";

export interface UserState {
  loading: boolean;
  authenticated: boolean;
  user?: User;
}

const initialState: UserState = {
  loading: false,
  authenticated: false
}

const _userReducer = createReducer(
  initialState,
  on(authenticate, (state) => ({...state, loading: true})),
  on(authenticateSuccess, (state, userData: {token: string, user: User}) => ({loading: false, authenticated: true, user: userData.user})),
  on(authenticateError, (state, {message}) => ({...state, loading: false, authenticated: false})),
  on(signOutSuccess, state => ({...state, authenticated: false, user: undefined})),
  on(signUpFP, state => ({...state, loading: true})),
  on(signUpFPSuccess, (state, userData: {token: string, user: User}) => ({loading: false, authenticated: true, user: userData.user})),
  on(signInFPError, state => ({...state, loading: false})),
  // on(verifyUserActionSuccess, state => {
  //   if (state.user)
  //     state = {...state, user: {...state.user, verified: 1}};
  //   return state;
  // }),
  // on(setUserSubscriptionStatus, (state, data) => {
  //   if (state.user) {
  //     state = {...state, user: {...state.user, accountStatus: data.status}}
  //     renewLocalStorage(state.user);
  //   }
  //   return state;
  // }),
  // on(setNewName, (state, data) => {
  //   if (state.user) {
  //     state = {...state, user: {...state.user, firstName: data.firstName}}
  //     renewLocalStorage(state.user);
  //   }
  //   return state;
  // }),
  on(updateUserDataSuccess, (state, userData) => state = {...state, user: userData.data, authenticated: true})
)

function renewLocalStorage(user: User | undefined) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function userReducer(state: UserState | undefined, action: Action) {
  return _userReducer(state, action)
}
