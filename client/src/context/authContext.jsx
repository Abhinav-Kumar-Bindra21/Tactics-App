import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { setCsrfToken } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check whether a valid login session already exists.

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);

      const csrfResponse = await api.get("/auth/csrf");
      setCsrfToken(csrfResponse.data.csrfToken);

      return response.data.user;
    } catch {
      setUser(null);
      setCsrfToken(null);
      return null;
    }
  }, []);

  useEffect(() => {
    async function checkSession() {
      try {
        await refreshUser();
      } finally {
        setAuthLoading(false);
      }
    }

    checkSession();
  }, [refreshUser]);

  // End the current login session.
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      setCsrfToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        authLoading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
