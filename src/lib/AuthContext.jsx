import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { localCurrentSession, localClearSession, localListUsers } from '@/lib/localAuth';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext();

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
    setUser(userData);
    setIsAuthenticated(true);
    setAuthChecked(true);
    setIsLoadingAuth(false);
    setAuthError(null);
    try { localStorage.setItem('user', JSON.stringify(userData)); } catch (e) { /* ignore */ }
  };

  // Hàm đăng xuất dùng chung trên toàn ứng dụng:
  // xoá phiên cục bộ + state rồi chuyển về /login
  const logout = (redirectUrl) => {
    // Xoá hoàn toàn Token, Session và thông tin User hiện tại.
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(true);
    setAuthError(null);
    localClearSession();
    try {
      sessionStorage.clear();
      localStorage.removeItem('base44_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    } catch (e) { /* ignore */ }
    
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