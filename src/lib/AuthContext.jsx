import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { localCurrentSession, localClearSession, localListUsers } from '@/lib/localAuth';
import { toast } from '@/components/ui/use-toast';
import { queryClientInstance } from '@/lib/query-client';

const AuthContext = createContext();

// Create BroadcastChannel for cross-tab auth state synchronization
let authChannel = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    authChannel = new BroadcastChannel("sands_auth_realtime_channel");
  } catch { /* ignore */ }
}

const clearAllAuthTokensAndCookies = () => {
  // 1. Clear TanStack Query Cache completely
  try {
    queryClientInstance.clear();
  } catch { /* ignore */ }

  // 2. Clear SessionStorage
  try {
    sessionStorage.clear();
  } catch { /* ignore */ }

  // 3. Clear LocalStorage Tokens & Session Keys
  try {
    const keysToRemove = [
      'user',
      'base44_token',
      'access_token',
      'auth_token',
      'token',
      'session_token',
      'sb-access-token',
      'sb-refresh-token',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    // Clear any supabase storage keys dynamically
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('sb-') || k.startsWith('supabase.')) {
        localStorage.removeItem(k);
      }
    });
  } catch { /* ignore */ }

  // 4. Clear Cookies
  try {
    if (typeof document !== 'undefined' && document.cookie) {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      });
    }
  } catch { /* ignore */ }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Khởi động: đọc phiên từ localStorage trực tiếp, không gọi Base44 API.
  useEffect(() => {
    const session = localCurrentSession();
    if (session) {
      setUser(session);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setAuthError(null);
    setIsLoadingAuth(false);
    setAuthChecked(true);

    // Cross-tab BroadcastChannel listener
    if (authChannel) {
      const handleAuthMsg = (e) => {
        if (e.data?.type === 'LOGOUT') {
          clearAllAuthTokensAndCookies();
          setUser(null);
          setIsAuthenticated(false);
          setAuthChecked(true);
        } else if (e.data?.type === 'LOGIN' && e.data?.user) {
          queryClientInstance.clear();
          setUser(e.data.user);
          setIsAuthenticated(true);
        }
      };
      authChannel.addEventListener('message', handleAuthMsg);
      return () => authChannel.removeEventListener('message', handleAuthMsg);
    }
  }, []);

  // Kiểm tra thời gian thực trạng thái khóa tài khoản
  useEffect(() => {
    if (!user || user.role === "admin" || user.role === "super_admin") return;

    const checkLockStatus = () => {
      try {
        const users = localListUsers();
        const currentInDb = users.find(
          (u) => u.id === user.id || u.account?.toLowerCase() === user.account?.toLowerCase()
        );
        if (currentInDb && currentInDb.locked) {
          toast({
            title: "Tài khoản bị khóa",
            description: "Tài khoản của bạn đã bị tạm khóa bởi QTV. Vui lòng liên hệ CSKH.",
            variant: "destructive",
          });
          logout('/login');
        }
      } catch { /* ignore */ }
    };

    checkLockStatus();

    const handleLocalUsersChanged = () => checkLockStatus();
    const handleStorage = (e) => {
      if (!e.key || e.key === "local_users" || e.key === "user") {
        checkLockStatus();
      }
    };

    window.addEventListener("local-users-changed", handleLocalUsersChanged);
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(checkLockStatus, 1500);

    return () => {
      window.removeEventListener("local-users-changed", handleLocalUsersChanged);
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [user]);

  // Cập nhật tức thì phiên sau khi đăng nhập/đăng ký thành công:
  // set user state + localStorage('user') + tắt loading để ProtectedRoute không kẹt/đẩy về /login
  const setSession = (userData) => {
    // Purge old cache first to avoid stale session sticking
    clearAllAuthTokensAndCookies();

    setUser(userData);
    setIsAuthenticated(true);
    setAuthChecked(true);
    setIsLoadingAuth(false);
    setAuthError(null);

    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) { /* ignore */ }

    if (authChannel) {
      try { authChannel.postMessage({ type: 'LOGIN', user: userData }); } catch { /* ignore */ }
    }
  };

  // Hàm đăng xuất dùng chung trên toàn ứng dụng:
  // xoá phiên cục bộ + state + TanStack Query cache + cookie rồi chuyển về /login
  const logout = (redirectUrl) => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(true);
    setAuthError(null);
    localClearSession();
    clearAllAuthTokensAndCookies();

    if (authChannel) {
      try { authChannel.postMessage({ type: 'LOGOUT' }); } catch { /* ignore */ }
    }

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      authChecked,
      logout,
      navigateToLogin,
      setSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};