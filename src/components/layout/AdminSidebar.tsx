import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ShieldCheck,
  IdCard,
  Users,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void; // desktop only
  open: boolean; // mobile only
  onClose: () => void; // mobile only
}

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  {
    group: "KYC Management",
    items: [
      { name: "KYC Levels", href: "/admin/kyc-levels", icon: ShieldCheck },
      { name: "KYC Details", href: "/admin/kyc-details", icon: IdCard },
      { name: "KYC Rules", href: "/admin/country-kyc-levels", icon: Globe },
    ]
  },
  {
    group: "User Management",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "User KYC Levels", href: "/admin/user-kyc-levels", icon: UserCheck },
      { name: "User KYC Details", href: "/admin/user-kyc-details", icon: IdCard },
    ]
  },
  {
    group: "Tools & Samples",
    items: [
      { name: "FIU India Sample", href: "/admin/fiu-india-sample", icon: FileText },
    ]
  },
  {
    group: "Account",
    items: [
      { name: "Profile", href: "/admin/profile", icon: Settings },
    ]
  },
];

export function AdminSidebar({
  collapsed,
  onToggle,
  open,
  onClose,
}: AdminSidebarProps) {
  const location = useLocation();

  const SidebarItem = ({
    item,
    collapsed,
  }: {
    item: { name: string; href: string; icon: any };
    collapsed: boolean;
  }) => {
    const isActive = location.pathname === item.href;

    const content = (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary-1 text-white"
            : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
          collapsed && "justify-center px-2"
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  const SidebarGroup = ({ group, collapsed }: { group: any; collapsed: boolean }) => {
    if (collapsed) {
      return (
        <div className="space-y-1">
          {group.items.map((item: any) => (
            <SidebarItem key={item.name} item={item} collapsed={collapsed} />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <h3 className="px-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          {group.group}
        </h3>
        <div className="space-y-1">
          {group.items.map((item: any) => (
            <SidebarItem key={item.name} item={item} collapsed={collapsed} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
          {!collapsed && (
            <h1 className="text-xl font-bold text-primary-1">KYC Admin</h1>
          )}
          {/* Collapse button (desktop only) */}
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
        <nav className="flex-1 space-y-6 p-4">
          {navigation.map((item, index) => {
            if ('name' in item && 'href' in item) {
              // Single item
              return (
                <SidebarItem key={item.name} item={item as { name: string; href: string; icon: any }} collapsed={collapsed} />
              );
            } else if ('group' in item) {
              // Group item
              return (
                <SidebarGroup key={item.group} group={item} collapsed={collapsed} />
              );
            }
            return null;
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
          <div
            className={cn(
              "flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400",
              collapsed && "justify-center"
            )}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span>Admin Panel</span>}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar (Slide-over) */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
              <h1 className="text-xl font-bold text-primary-1">KYC Admin</h1>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-6 p-4">
              {navigation.map((item, index) => {
                if ('name' in item && 'href' in item) {
                  // Single item
                  return (
                    <SidebarItem key={item.name} item={item as { name: string; href: string; icon: any }} collapsed={false} />
                  );
                } else if ('group' in item) {
                  // Group item
                  return (
                    <SidebarGroup key={item.group} group={item} collapsed={false} />
                  );
                }
                return null;
              })}
            </nav>

            {/* Footer */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <Settings className="h-4 w-4" />
                <span>Admin Panel</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}