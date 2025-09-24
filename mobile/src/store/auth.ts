import { create } from 'zustand';
import { setAuthToken } from '../lib/api';

type Role = 'USER' | 'VENDOR' | 'ADMIN';

type AuthState = {
  token?: string;
  role?: Role;
  setAuth: (token: string, role: Role) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: undefined,
  role: undefined,
  setAuth: (token, role) => {
    setAuthToken(token);
    set({ token, role });
  },
  clear: () => {
    setAuthToken(undefined);
    set({ token: undefined, role: undefined });
  },
}));

