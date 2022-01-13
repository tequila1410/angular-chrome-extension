import {ActionReducer, ActionReducerMap, MetaReducer} from "@ngrx/store/src/models";
import {userReducer, UserState} from "./user/user.reducer";

export interface AppState {
  user: UserState
}

export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
  return function(state, action) {
    console.log('state', state);
    console.log('action', action);

    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<any>[] = [debug];

export const reducers: ActionReducerMap<AppState> = {
  user: userReducer
}
