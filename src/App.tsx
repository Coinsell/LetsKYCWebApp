import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { KYCProvider } from "./contexts/KYCAdminContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminLayout } from "./components/layout/AdminLayout";
import { UserLayout } from "./components/layout/UserLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { DynamicKYCJourneyPage } from "./pages/user/DynamicKYCJourneyPage";
import { LoadingSpinner } from "./components/ui/loading-spinner";

function AppContent() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Define public routes that don't require authentication
  const publicRoutes = ['/journey'];
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If it's a public route, render without authentication
  if (isPublicRoute) {
    return (
      <KYCProvider>
        <Routes>
          <Route path="/journey/:userId" element={<DynamicKYCJourneyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </KYCProvider>
    );
  }

  // For protected routes, require authentication
  if (!user) {
    return <LoginPage />;
  }

  // Determine if user is admin based on roles
  const isAdmin =
    user.roles?.includes("admin") || user.roles?.includes("administrator");

  return (
    <KYCProvider>{isAdmin ? <AdminLayout /> : <UserLayout />}</KYCProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
