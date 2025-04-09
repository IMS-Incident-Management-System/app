import { signInUser } from "./actions";
import { UserResponse } from "../../../interfaces/requests/auth";
import { selectUserSelector } from "./selectors";
import { asyncThunkCreator, buildCreateSlice, current } from "@reduxjs/toolkit";

const initialState: UserResponse | undefined = {
  given_name: "",
  family_name: "",
  email: "",
  email_verified: false,
  groups: [],
  locale: "",
  name: "",
  preferred_username: "",
  roles: [],
  sub: "",
  error: null,
};

export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export const userSlice = createAppSlice({
  name: "user",
  initialState,
  reducers: (create) => ({
    signIn: create.reducer((data, action) => signInUser(action.payload as any)),
    // logout: create.asyncThunk(logoutAction, {
    //   fulfilled: (state, action) => {
    //     return initialState;
    //   },
    // }),
  }),
  selectors: {
    selectUser: selectUserSelector,
  },
});

export const { signIn } = userSlice.actions;
export const { selectUser } = userSlice.selectors;

export default userSlice.reducer;
