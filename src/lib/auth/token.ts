const ACCESS_TOKEN_KEY = "smartroad_access_token";
const REFRESH_TOKEN_KEY = "smartroad_refresh_token";

export const tokenStorage = {
  getAccessToken: () => typeof window === "undefined" ? null : window.sessionStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string | null) => { if (typeof window !== "undefined") { if (token) window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token); else window.sessionStorage.removeItem(ACCESS_TOKEN_KEY); } },
  getRefreshToken: () => typeof window === "undefined" ? null : window.sessionStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => { if (typeof window !== "undefined") window.sessionStorage.setItem(REFRESH_TOKEN_KEY, token); },
  clear: () => { if (typeof window !== "undefined") { window.sessionStorage.removeItem(ACCESS_TOKEN_KEY); window.sessionStorage.removeItem(REFRESH_TOKEN_KEY); } },
};

export const getAccessToken = tokenStorage.getAccessToken;
export const setAccessToken = tokenStorage.setAccessToken;
export const clearAccessToken = () => tokenStorage.setAccessToken(null);
