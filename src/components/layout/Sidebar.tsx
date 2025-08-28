import { Fragment, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  X, 
  Home, 
  ShieldCheck, 
  FileText, 
  Users,
  UserCheck,
  ClipboardList,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'KYC Levels', href: '/kyc-levels', icon: ShieldCheck },
  { name: 'KYC Details', href: '/kyc-details', icon: FileText },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'User KYC Levels', href: '/user-kyc-levels', icon: UserCheck },
  { name: 'User KYC Details', href: '/user-kyc-details', icon: ClipboardList },
  { name: 'KYC Updates', href: '/user-kyc-updates', icon: RotateCcw },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-xl font-bold text-primary-1">KYC Admin</h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      location.pathname === item.href
                        ? 'bg-neutral-50 text-primary-1'
                        : 'text-neutral-700 hover:text-primary-1 hover:bg-neutral-50',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                    )}
                    onClick={onClose}
                  >
                    <item.icon
                      className={cn(
                        location.pathname === item.href ? 'text-primary-1' : 'text-neutral-400 group-hover:text-primary-1',
                        'h-6 w-6 shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      {open && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-neutral-600/80" onClick={onClose} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </Button>
              </div>
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-neutral-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-primary-1">KYC Admin</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          location.pathname === item.href
                            ? 'bg-neutral-50 text-primary-1'
                            : 'text-neutral-700 hover:text-primary-1 hover:bg-neutral-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={cn(
                            location.pathname === item.href ? 'text-primary-1' : 'text-neutral-400 group-hover:text-primary-1',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}