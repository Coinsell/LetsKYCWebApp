import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export function UserKYCDetailsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">User KYC Details</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Track individual user KYC progress and details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User KYC Progress</CardTitle>
          <CardDescription>Monitor user progress through KYC steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-neutral-500">User KYC Details tracking coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}