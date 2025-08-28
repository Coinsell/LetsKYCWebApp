import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Pencil, Save, X } from 'lucide-react'

export function UserProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  })

  const handleSave = () => {
    // Save profile changes
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          My Profile
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Manage your account information and KYC status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                <AvatarFallback className="text-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">{user?.email}</p>
                <div className="flex gap-2 mt-2">
                  {user?.roles?.map((role) => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>KYC Status</CardTitle>
            <CardDescription>Your verification status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="warning" className="mb-4">
                In Progress
              </Badge>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Complete your KYC verification to unlock all features
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Personal Info</span>
                <Badge variant="success">✓</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Phone Verification</span>
                <Badge variant="success">✓</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Address Proof</span>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Identity Proof</span>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </div>

            <Button className="w-full" asChild>
              <a href="/user/kyc-journey">Continue KYC</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}