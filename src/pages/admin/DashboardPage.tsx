import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { useKYCAdmin, KYCStatus } from '../../contexts/KYCAdminContext'
import { ShieldCheck, FileText, Users, ClipboardList } from 'lucide-react'

export function DashboardPage() {
  const { state } = useKYCAdmin()

  const stats = [
    {
      name: 'KYC Levels',
      value: state.kycLevels.length,
      icon: ShieldCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'KYC Details',
      value: state.kycDetails.length,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Total Users',
      value: state.users.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'User KYC Details',
      value: state.userKycDetails.length,
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const kycStatusCounts = Object.values(KYCStatus).reduce((acc, status) => {
    acc[status] = state.users.filter(user => user.kyc_status === status).length
    return acc
  }, {} as Record<KYCStatus, number>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Overview of KYC administration system
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.bgColor} dark:${stat.bgColor}/20`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{stat.name}</p>
                  <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>KYC Status Distribution</CardTitle>
            <CardDescription>Current status of all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(kycStatusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        status === KYCStatus.Approved ? 'success' :
                        status === KYCStatus.Rejected ? 'destructive' :
                        status === KYCStatus.UnderReview ? 'warning' :
                        status === KYCStatus.InProgress ? 'default' :
                        'secondary'
                      }
                    >
                      {status}
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates in the KYC system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.userKycUpdates.slice(0, 5).map((update) => (
                <div key={update.id} className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <div>
                    <p className="text-sm font-medium">User ID: {update.userId}</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{update.updateType}</p>
                  </div>
                  <Badge variant="outline">{update.status}</Badge>
                </div>
              ))}
              {state.userKycUpdates.length === 0 && (
                <p className="text-sm text-neutral-500">No recent updates</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}