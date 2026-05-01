import { create } from "zustand";

import { createAuthSlice, type AuthState } from "@/store/slices/auth.slice";

export type AppStore = AuthState;

export const useAppStore = create<AppStore>()((set) => ({
  ...createAuthSlice((partial) => set(partial)),
}));
