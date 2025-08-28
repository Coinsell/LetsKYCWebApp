import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { KYCProvider } from './contexts/KYCAdminContext'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { KYCLevelsPage } from './pages/KYCLevelsPage'
import { KYCDetailsPage } from './pages/KYCDetailsPage'
import { UsersPage } from './pages/UsersPage'
import { UserKYCLevelsPage } from './pages/UserKYCLevelsPage'
import { UserKYCDetailsPage } from './pages/UserKYCDetailsPage'
import { UserKYCUpdatesPage } from './pages/UserKYCUpdatesPage'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <KYCProvider>
      <Router>
        <div className="min-h-screen bg-neutral-200">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <div className="lg:pl-64">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            
            <main className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/kyc-levels" element={<KYCLevelsPage />} />
                  <Route path="/kyc-details" element={<KYCDetailsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/user-kyc-levels" element={<UserKYCLevelsPage />} />
                  <Route path="/user-kyc-details" element={<UserKYCDetailsPage />} />
                  <Route path="/user-kyc-updates" element={<UserKYCUpdatesPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </KYCProvider>
  )
}

export default App