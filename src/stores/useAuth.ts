import { create } from "zustand";
import { User } from "../types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  setUser: (user: User | null) => void;
  setCheckingAuth: (status: boolean) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isCheckingAuth: false }),
  setCheckingAuth: (status) => set({ isCheckingAuth: status }),
  logout: () =>
    set({ user: null, isAuthenticated: false, isCheckingAuth: false }),
}));
