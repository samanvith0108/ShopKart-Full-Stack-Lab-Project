import { useCallback, useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../axiosCalls/axios";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");

  const loadAuth = useCallback(async (signal) => {
    try {
      await axiosInstance.get("/customers/me", { signal });
      return "authenticated";
    } catch (error) {
      return error.response?.status === 401 ? "unauthenticated" : "error";
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    loadAuth(controller.signal).then((nextStatus) => {
      if (active) setStatus(nextStatus);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [loadAuth]);

  const value = useMemo(() => ({
    status,
    markAuthenticated: () => setStatus("authenticated"),
    markUnauthenticated: () => setStatus("unauthenticated"),
    retryAuthCheck: () => {
      setStatus("loading");
      loadAuth().then(setStatus);
    },
  }), [status, loadAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
