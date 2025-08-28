import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  ShieldCheck, 
  Users,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'KYC Levels', href: '/admin/kyc-levels', icon: ShieldCheck },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'FIU India Sample', href: '/admin/fiu-india-sample', icon: FileText },
  { name: 'Profile', href: '/admin/profile', icon: UserCheck },
]

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation()

  const SidebarItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location.pathname === item.href
    
    const content = (
      <Link
        to={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-1 text-white'
            : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
          collapsed && 'justify-center px-2'
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    )

    if (collapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return content
  }

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
        {!collapsed && (
          <h1 className="text-xl font-bold text-primary-1">KYC Admin</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <SidebarItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
        <div className={cn(
          'flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400',
          collapsed && 'justify-center'
        )}>
          <Settings className="h-4 w-4" />
          {!collapsed && <span>Admin Panel</span>}
        </div>
      </div>
    </div>
  )
}