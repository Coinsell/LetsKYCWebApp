import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export function UserKYCUpdatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">KYC Updates</h1>
        <p className="mt-2 text-sm text-neutral-600">
          View audit trail of KYC changes and updates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KYC Update History</CardTitle>
          <CardDescription>Audit trail of all KYC-related changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-neutral-500">KYC Updates audit trail coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}