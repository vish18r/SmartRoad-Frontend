import { authApi } from "@/lib/api/auth-api";
import type { AuthResponse, User } from "@/types/auth";
import { tokenStorage } from "./token";

let currentUser: User | null = null;
export const auth = {
  isAuthenticated: () => Boolean(currentUser || tokenStorage.getAccessToken() || tokenStorage.getRefreshToken()),
  getUser: () => currentUser,
  setSession: (session: AuthResponse) => { tokenStorage.setAccessToken(session.accessToken); tokenStorage.setRefreshToken(session.refreshToken); currentUser = session.user; },
  restoreSession: async () => {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) { currentUser = null; return null; }
    try { currentUser = await authApi.getCurrentUser(); return currentUser; } catch { currentUser = null; return null; }
  },
  logout: async () => { const refreshToken = tokenStorage.getRefreshToken(); try { if (refreshToken) await authApi.logout(refreshToken); } finally { tokenStorage.clear(); currentUser = null; } },
  logoutAll: async () => { try { await authApi.logoutAll(); } finally { tokenStorage.clear(); currentUser = null; } },
  clear: () => { tokenStorage.clear(); currentUser = null; },
};
