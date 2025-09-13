import { Routes, Route, Navigate } from 'react-router-dom'
import { UserHeader } from './UserHeader'
import { UserProfilePage } from '../../pages/user/UserProfilePage'
import { DynamicKYCJourneyPage } from '../../pages/user/DynamicKYCJourneyPage'
import { FIUIndiaJourneyPage } from '../../pages/user/FIUIndiaJourneyPage'
import { UserKYCLevelsPage } from '../../pages/UserKYCLevelsPage'
import { UserKYCDetailsPage } from '../../pages/UserKYCDetailsPage'
import { UserKYCLevelDetailsPage } from '../../pages/user/UserKYCLevelDetailsPage'

export function UserLayout() {
  return (
    <div className="min-h-screen bg-background">
      <UserHeader />
      
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Navigate to="/user/profile" replace />} />
            <Route path="/user/profile" element={<UserProfilePage />} />
            <Route path="/user/kyc-journey" element={<DynamicKYCJourneyPage />} />
            <Route path="/user/kyc-levels" element={<UserKYCLevelsPage />} />
            <Route path="/user/kyc-levels/:levelId" element={<UserKYCLevelDetailsPage />} />
            <Route path="/user/kyc-details" element={<UserKYCDetailsPage />} />
            <Route path="/user/fiu-india-journey" element={<FIUIndiaJourneyPage />} />
            <Route path="*" element={<Navigate to="/user/profile" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}