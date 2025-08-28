import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export function UserKYCLevelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">User KYC Levels</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Assign and manage KYC levels for users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User KYC Level Assignments</CardTitle>
          <CardDescription>Manage which KYC level each user is assigned to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-neutral-500">User KYC Levels management coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}