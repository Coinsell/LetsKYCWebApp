import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { DashboardPage } from "../../pages/admin/DashboardPage";
import { KYCLevelsPage } from "../../pages/admin/KYCLevelsPage";
import { UsersPage } from "../../pages/admin/UsersPage";
import { UserDetailPage } from "../../pages/admin/UserDetailPage";
import { UserKYCReviewPage } from "../../pages/admin/UserKYCReviewPage";
import { AdminProfilePage } from "../../pages/admin/AdminProfilePage";
import { FIUIndiaJourneyPage } from "../../pages/user/FIUIndiaJourneyPage";
import { KYCDetailsPage } from "@/pages/KYCDetailsPage";
import KYCLevelDetailsPage from "@/pages/KYCLevelDetailsPage";

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop only
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile only

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/kyc-levels" element={<KYCLevelsPage />} />
              <Route path="/admin/kyc-details" element={<KYCDetailsPage />} />
              {/* <Route
                path="/admin/kyc-levels/:id"
                element={<KYCLevelDetailsPage />}
              />
              <Route
                path="/admin/kyc-levels/new"
                element={<KYCLevelDetailsPage />}
              /> */}
              <Route
                path="/admin/kyc-levels/new"
                element={<KYCLevelDetailsPage mode="create" />}
              />
              <Route
                path="/admin/kyc-levels/:id"
                element={<KYCLevelDetailsPage mode="edit" />}
              />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/users/:userId" element={<UserDetailPage />} />
              <Route
                path="/admin/users/:userId/kyc-review"
                element={<UserKYCReviewPage />}
              />
              <Route path="/admin/profile" element={<AdminProfilePage />} />
              <Route
                path="/admin/fiu-india-sample"
                element={<FIUIndiaJourneyPage />}
              />
              <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
