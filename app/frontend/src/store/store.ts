import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch as useAppDispatch } from "react-redux";
import { userReducer } from "./features/user/userSlice";

const rootReducer: any = combineReducers({ user: userReducer });
export const store = configureStore({ reducer: rootReducer });

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppStore = typeof store;

export const useDispatch = () => useAppDispatch<AppDispatch>();
