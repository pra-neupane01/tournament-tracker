import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tokenStorage } from '../../services/api/tokenStorage';
import { authService } from './authService';
import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from './types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
}

const acceptSession = (response: AuthResponse) => {
  tokenStorage.setTokens(response.accessToken, response.refreshToken);
  return response.user;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: Boolean(tokenStorage.getAccessToken()),
      isRestoring: false,
      login: async (input) => {
        const response = await authService.login(input);
        set({ user: acceptSession(response), isAuthenticated: true });
      },
      register: async (input) => {
        const response = await authService.register(input);
        if ('accessToken' in response) {
          set({ user: acceptSession(response), isAuthenticated: true });
        }
      },
      restoreSession: async () => {
        if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
          set({ user: null, isAuthenticated: false, isRestoring: false });
          return;
        }

        set({ isRestoring: true });
        try {
          const user = await authService.currentUser();
          set({ user, isAuthenticated: true, isRestoring: false });
        } catch {
          tokenStorage.clear();
          set({ user: null, isAuthenticated: false, isRestoring: false });
        }
      },
      logout: async () => {
        const refreshToken = tokenStorage.getRefreshToken();
        try {
          if (refreshToken) {
            await authService.logout(refreshToken);
          }
        } finally {
          tokenStorage.clear();
          set({ user: null, isAuthenticated: false, isRestoring: false });
        }
      },
      clearSession: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false, isRestoring: false });
      },
    }),
    {
      name: 'esports.auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
