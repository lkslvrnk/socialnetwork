import {AnyAction, applyMiddleware, combineReducers, createStore} from "redux";
import thunkMiddleware, { ThunkDispatch } from 'redux-thunk';
import profileReducer from './profile_reducer';
import authReducer from './auth_reducer';
import appReducer from './app_reducer';
import photosReducer from './photos_reducer';
import connectionsReducer from './connections_reducer';
import feedReducer from './feed_reducer';
import profilePostsReducer from './profile_posts_reducer'
import { reducer as formReducer } from 'redux-form'
import subscriptionsReducer from "./subscriptions_reducer";
import usersReducer from "./users_reducer";

let rootReducer = combineReducers({
    auth: authReducer,
    form: formReducer,
    profile: profileReducer,
    app: appReducer,
    photos: photosReducer,
    connections: connectionsReducer,
    feed: feedReducer,
    profilePosts: profilePostsReducer,
    subscriptions: subscriptionsReducer,
    users: usersReducer
});

export type InferActionsTypes<T> = T extends { [keys: string]: (...args: any[]) => infer U } ? U : never

type RootReducerType = typeof rootReducer
export type AppStateType = ReturnType<RootReducerType>

let store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
export type AppDispatch = ThunkDispatch<AppStateType, any, AnyAction>

export default store;
