let accessToken: string | null = null;
const REFRESH_TOKEN_KEY = "smartroad_refresh_token";

export const tokenStorage = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => { accessToken = token; },
  getRefreshToken: () => typeof window === "undefined" ? null : window.sessionStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => { if (typeof window !== "undefined") window.sessionStorage.setItem(REFRESH_TOKEN_KEY, token); },
  clear: () => { accessToken = null; if (typeof window !== "undefined") window.sessionStorage.removeItem(REFRESH_TOKEN_KEY); },
};

export const getAccessToken = tokenStorage.getAccessToken;
export const setAccessToken = tokenStorage.setAccessToken;
export const clearAccessToken = () => tokenStorage.setAccessToken(null);
