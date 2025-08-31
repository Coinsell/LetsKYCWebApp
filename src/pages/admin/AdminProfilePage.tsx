import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Pencil, Save, X, Settings, Bell, Shield, User } from "lucide-react";

export function AdminProfilePage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    kycAlerts: true,
    systemUpdates: false,
    weeklyReports: true,
  });

  const handleSave = () => {
    // Save profile changes
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Admin Profile
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
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
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                <AvatarFallback className="text-lg">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {user?.email}
                </p>
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
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Stats
            </CardTitle>
            <CardDescription>Your administrative overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Users Managed</span>
                <Badge variant="outline">156</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>KYC Reviews</span>
                <Badge variant="outline">23</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Active Levels</span>
                <Badge variant="outline">5</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Last Login</span>
                <span className="text-neutral-500">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Preferences
            </CardTitle>
            <CardDescription>Customize your admin experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Choose your preferred theme
                  </p>
                </div>
                <Select
                  value={theme}
                  onValueChange={(value: "light" | "dark") => setTheme(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Select your preferred language
                  </p>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Receive email updates
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailNotifications: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="kycAlerts">KYC Alerts</Label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    New KYC submissions
                  </p>
                </div>
                <Switch
                  id="kycAlerts"
                  checked={notifications.kycAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, kycAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemUpdates">System Updates</Label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    System maintenance alerts
                  </p>
                </div>
                <Switch
                  id="systemUpdates"
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      systemUpdates: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyReports">Weekly Reports</Label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Weekly summary emails
                  </p>
                </div>
                <Switch
                  id="weeklyReports"
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      weeklyReports: checked,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
