import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/adminApi';
import { setUnauthorizedHandler, tokenStore } from '../api/http';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    status: tokenStore.get() ? 'loading' : 'anonymous',
    user: null,
    store: null,
  });

  const logout = useCallback(() => {
    tokenStore.clear();
    setState({ status: 'anonymous', user: null, store: null });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  // Провери постоечка сесија
  useEffect(() => {
    if (!tokenStore.get()) return;
    let cancelled = false;
    authApi
      .me()
      .then(({ user, store }) => !cancelled && setState({ status: 'authenticated', user, store }))
      .catch(() => !cancelled && logout());
    return () => {
      cancelled = true;
    };
  }, [logout]);

  const applySession = useCallback(({ token, user, store }) => {
    tokenStore.set(token);
    setState({ status: 'authenticated', user, store });
  }, []);

  const login = useCallback(async (credentials) => applySession(await authApi.login(credentials)), [applySession]);
  const register = useCallback(async (data) => applySession(await authApi.register(data)), [applySession]);
  const setStore = useCallback((store) => setState((s) => ({ ...s, store })), []);

  const value = useMemo(
    () => ({ ...state, login, register, logout, setStore }),
    [state, login, register, logout, setStore],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth мора да се користи во <AuthProvider>.');
  return ctx;
}
