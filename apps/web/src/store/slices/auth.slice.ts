import type { AuthUser } from "@opsflow/shared";

export type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setHydrated: (hydrated: boolean) => void;
  clearAuth: () => void;
};

export const createAuthSlice = (set: (partial: Partial<AuthState>) => void): AuthState => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
  clearAuth: () => set({ user: null, hydrated: true }),
});
