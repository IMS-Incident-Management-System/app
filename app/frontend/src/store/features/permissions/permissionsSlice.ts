import { createSlice } from "@reduxjs/toolkit";
import type { PermissionsResponse } from "../../../api/permissions/permissions";

const initialState: PermissionsResponse = {
  permissions: [],
  byEntity: {},
};

export const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    setPermissions: (_, action: { payload: PermissionsResponse }) => action.payload,
    clearPermissions: () => initialState,
  },
});

export const { setPermissions, clearPermissions } = permissionsSlice.actions;
export const permissionsReducer = permissionsSlice.reducer;
