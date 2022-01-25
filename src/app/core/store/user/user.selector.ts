import { createSelector } from '@ngrx/store';
import {AppState} from "../app.reducer";
import {UserState} from "./user.reducer";

export const selectUser = (state: AppState) => state.user;

export const getUserData = createSelector(
  selectUser,
  (state: UserState) => state.user
)

export const isUserAuthenticated = createSelector(
  selectUser,
  (state: UserState) => state.authenticated
)
