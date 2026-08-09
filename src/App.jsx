import { Toaster } from "@/components/ui/toaster"
import { TextToaster } from "@/components/ui/text-toast"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { I18nProvider } from '@/lib/I18nContext';
import { NotificationProvider } from '@/lib/NotificationContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import ContainerAug4CodiaStudio from './pages/ContainerAug4CodiaStudio';
import ContainerAug4CodiaStudio2 from './pages/ContainerAug4CodiaStudio2';
import ContainerAug4CodiaStudio3 from './pages/ContainerAug4CodiaStudio3';
import ContainerAug4CodiaStudio4 from './pages/ContainerAug4CodiaStudio4';
import ChartPage from './pages/ChartPage';
import DrawDetailsPage from './pages/DrawDetailsPage';
import AdminRoute from '@/components/admin/AdminRoute';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminApp from './pages/admin/AdminApp';
import Login from './pages/Login';
import Register from './pages/Register';
import Splash from './pages/Splash';
import OAuthConsent from './pages/OAuthConsent';
// Add page imports here

import { useEffect } from 'react';
import { settlePendingBets } from '@/lib/gameRoundManager';

const GlobalBetSettler = () => {
  const { user } = useAuth();
  useEffect(() => {
    if (!user?.id) return;
    settlePendingBets(user.id);
    const timer = setInterval(() => {
      settlePendingBets(user.id);
    }, 3000);
    return () => clearInterval(timer);
  }, [user?.id]);
  return null;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      const PUBLIC_ROUTES = ['/', '/login', '/register', '/oauth/consent'];
      if (!PUBLIC_ROUTES.includes(window.location.pathname)) {
        navigateToLogin();
        return null;
      }
    }
  }

  return (
    <>
      <GlobalBetSettler />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/giai-thuong" element={<ContainerAug4CodiaStudio />} />
          <Route path="/cua-toi" element={<ContainerAug4CodiaStudio2 />} />
          <Route path="/sanh-choi" element={<ContainerAug4CodiaStudio3 />} />
          <Route path="/choi-game/:gameId" element={<ContainerAug4CodiaStudio4 />} />
          <Route path="/bieu-do/:gameId" element={<ChartPage />} />
          <Route path="/ket-qua/:gameId" element={<DrawDetailsPage />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminApp />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/consent" element={<OAuthConsent />} />
        {/* Add your page Route elements here */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <I18nProvider>
      <NotificationProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <TextToaster />
        </QueryClientProvider>
      </NotificationProvider>
      </I18nProvider>
    </AuthProvider>
  )
}

export default App