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
import { KYCCountryAssignmentsPage } from "@/pages/admin/KYCCountryAssignmentsPage";
import { AdminUserKYCLevelsPage } from "@/pages/admin/AdminUserKYCLevelsPage";
import { AdminUserKYCDetailsPage } from "@/pages/admin/AdminUserKYCDetailsPage";
import { AdminUserKYCLevelDetailsPage } from "@/pages/admin/AdminUserKYCLevelDetailsPage";
import { CountriesPage } from "@/pages/admin/CountriesPage";
import { ProvincesPage } from "@/pages/admin/ProvincesPage";
import { CitiesPage } from "@/pages/admin/CitiesPage";
import { ISDCodesPage } from "@/pages/admin/ISDCodesPage";
import { OccupationsPage } from "@/pages/admin/OccupationsPage";
import { ProfessionsPage } from "@/pages/admin/ProfessionsPage";
import CountryDetailsPage from "@/pages/admin/CountryDetailsPage";
import ProvinceDetailsPage from "@/pages/admin/ProvinceDetailsPage";
import OccupationDetailsPage from "@/pages/admin/OccupationDetailsPage";
import ProfessionDetailsPage from "@/pages/admin/ProfessionDetailsPage";

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
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-72"
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
              <Route
                path="/admin/country-kyc-levels"
                element={<KYCCountryAssignmentsPage />}
              />
              <Route
                path="/admin/user-kyc-levels"
                element={<AdminUserKYCLevelsPage />}
              />
              <Route
                path="/admin/user-kyc-levels/:levelId"
                element={<AdminUserKYCLevelDetailsPage />}
              />
              <Route
                path="/admin/user-kyc-details"
                element={<AdminUserKYCDetailsPage />}
              />
              {/* Geographic Data Routes */}
              <Route path="/admin/countries" element={<CountriesPage />} />
              <Route path="/admin/countries/new" element={<CountryDetailsPage mode="create" />} />
              <Route path="/admin/countries/:code" element={<CountryDetailsPage mode="edit" />} />
              <Route path="/admin/provinces" element={<ProvincesPage />} />
              <Route path="/admin/provinces/new" element={<ProvinceDetailsPage mode="create" />} />
              <Route path="/admin/provinces/:countryCode/:code" element={<ProvinceDetailsPage mode="edit" />} />
              <Route path="/admin/cities" element={<CitiesPage />} />
              <Route path="/admin/cities/new" element={<CitiesPage />} />
              <Route path="/admin/cities/:code" element={<CitiesPage />} />
              <Route path="/admin/isd-codes" element={<ISDCodesPage />} />
              <Route path="/admin/isd-codes/new" element={<ISDCodesPage />} />
              <Route path="/admin/isd-codes/:id" element={<ISDCodesPage />} />
              {/* Occupation & Profession Routes */}
              <Route path="/admin/occupations" element={<OccupationsPage />} />
              <Route path="/admin/occupations/new" element={<OccupationDetailsPage mode="create" />} />
              <Route path="/admin/occupations/:code" element={<OccupationDetailsPage mode="edit" />} />
              <Route path="/admin/occupations/:code/professions" element={<ProfessionsPage />} />
              <Route path="/admin/professions" element={<ProfessionsPage />} />
              <Route path="/admin/professions/new" element={<ProfessionDetailsPage mode="create" />} />
              <Route path="/admin/professions/:code" element={<ProfessionDetailsPage mode="edit" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
