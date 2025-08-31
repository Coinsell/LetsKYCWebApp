import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { KYCProvider } from "./contexts/KYCAdminContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminLayout } from "./components/layout/AdminLayout";
import { UserLayout } from "./components/layout/UserLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { LoadingSpinner } from "./components/ui/loading-spinner";

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
