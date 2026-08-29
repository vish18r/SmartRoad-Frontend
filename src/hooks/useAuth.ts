"use client";
import { useCallback, useEffect, useState } from "react";
import { auth } from "@/lib/auth/auth";
import type { User } from "@/types/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.getUser());
  const [loading, setLoading] = useState(true);
  const restore = useCallback(async () => { setLoading(true); const restored = await auth.restoreSession(); setUser(restored); setLoading(false); return restored; }, []);
  useEffect(() => { void restore(); }, [restore]);
  return { user, loading, isAuthenticated: Boolean(user), restore, logout: auth.logout, logoutAll: auth.logoutAll };
}
