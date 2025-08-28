import { Sun, Moon, User, FileText, Home } from 'lucide-react'
import { Button } from '../ui/button'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Profile', href: '/user/profile', icon: Home },
  { name: 'KYC Journey', href: '/user/kyc-journey', icon: FileText },
]

export function UserHeader() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-primary-1">KYC Portal</h1>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary-1',
                  location.pathname === item.href
                    ? 'text-primary-1'
                    : 'text-neutral-600 dark:text-neutral-400'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.firstName} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/user/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}