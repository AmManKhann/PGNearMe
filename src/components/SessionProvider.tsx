"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { UserSession } from "@/lib/auth";

interface SessionContextValue {
  user: UserSession | null;
  login: (user: UserSession) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
});

const STORAGE_KEY = "pgnearme_session";
const COOKIE_KEY = "pgnearme_auth";
const ROLE_COOKIE_KEY = "pgnearme_role";

function readStoredUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

function setAuthCookie(role?: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${COOKIE_KEY}=1; path=/; max-age=2592000; samesite=lax`;
  if (role) {
    document.cookie = `${ROLE_COOKIE_KEY}=${role}; path=/; max-age=2592000; samesite=lax`;
  }
}

function clearAuthCookie() {
  if (typeof window === "undefined") return;
  document.cookie = `${COOKIE_KEY}=1; path=/; max-age=0`;
  document.cookie = `${ROLE_COOKIE_KEY}=; path=/; max-age=0`;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => readStoredUser());

  const login = useCallback((session: UserSession) => {
    setUser(session);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
    setAuthCookie(session.role);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    clearAuthCookie();
  }, []);

  return (
    <SessionContext.Provider value={{ user, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}