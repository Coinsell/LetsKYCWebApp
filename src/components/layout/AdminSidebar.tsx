import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  ShieldCheck,
  IdCard,
  Users,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
  Globe,
  MapPin,
  Phone,
  Briefcase,
  Building2,
  Database,
  Cog,
  BarChart3,
  UserCog,
  Map,
  Workflow,
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

// Hierarchical navigation structure
const navigation = [
  // 1. Dashboard - Always at top
  { 
    name: "Dashboard", 
    href: "/admin/dashboard", 
    icon: Home,
    type: "single"
  },
  
  // 2. Master Data & Main Functionality - Top priority
  {
    name: "Master Data",
    icon: Database,
    type: "group",
    defaultExpanded: true,
    items: [
      {
        name: "User Management",
        icon: UserCog,
        type: "subgroup",
        items: [
          { name: "Users", href: "/admin/users", icon: Users },
          { name: "User KYC Levels", href: "/admin/user-kyc-levels", icon: UserCheck },
          { name: "User KYC Details", href: "/admin/user-kyc-details", icon: IdCard },
        ]
      },
      {
        name: "KYC Management",
        icon: ShieldCheck,
        type: "subgroup",
        items: [
          { name: "KYC Levels", href: "/admin/kyc-levels", icon: ShieldCheck },
          { name: "KYC Details", href: "/admin/kyc-details", icon: IdCard },
          { name: "KYC Rules", href: "/admin/country-kyc-levels", icon: Globe },
        ]
      }
    ]
  },
  
  // 3. Supplemental Data - Secondary priority
  {
    name: "Supplemental Data",
    icon: Map,
    type: "group",
    defaultExpanded: false,
    items: [
      {
        name: "Geographic Data",
        icon: Globe,
        type: "subgroup",
        items: [
          { name: "Countries", href: "/admin/countries", icon: Globe },
          { name: "Provinces", href: "/admin/provinces", icon: MapPin },
          { name: "Cities", href: "/admin/cities", icon: Building2 },
          { name: "ISD Codes", href: "/admin/isd-codes", icon: Phone },
        ]
      },
      {
        name: "Occupations & Professions",
        icon: Workflow,
        type: "subgroup",
        items: [
          { name: "Occupations", href: "/admin/occupations", icon: Briefcase },
          { name: "Professions", href: "/admin/professions", icon: Users },
        ]
      }
    ]
  },
  
  // 4. Setup Data and Configuration - Bottom priority
  {
    name: "Setup & Configuration",
    icon: Cog,
    type: "group",
    defaultExpanded: false,
    items: [
      {
        name: "Tools & Samples",
        icon: FileText,
        type: "subgroup",
        items: [
          { name: "FIU India Sample", href: "/admin/fiu-india-sample", icon: FileText },
        ]
      },
      {
        name: "Account",
        icon: Settings,
        type: "subgroup",
        items: [
          { name: "Profile", href: "/admin/profile", icon: Settings },
        ]
      }
    ]
  }
];

export function AdminSidebar({
  collapsed,
  onToggle,
  open,
  onClose,
}: AdminSidebarProps) {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(navigation.filter(item => item.type === "group" && item.defaultExpanded).map(item => item.name))
  );

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const SidebarItem = ({
    item,
    collapsed,
    level = 0,
  }: {
    item: { name: string; href: string; icon: any };
    collapsed: boolean;
    level?: number;
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
          collapsed && "justify-center px-2",
          level > 0 && "ml-4"
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

  const SidebarSubGroup = ({ 
    subgroup, 
    collapsed, 
    level = 0 
  }: { 
    subgroup: any; 
    collapsed: boolean; 
    level?: number;
  }) => {
    const isExpanded = expandedGroups.has(subgroup.name);
    
    if (collapsed) {
      return (
        <div className="space-y-1">
          {subgroup.items.map((item: any) => (
            <SidebarItem key={item.name} item={item} collapsed={collapsed} level={level + 1} />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleGroup(subgroup.name)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors",
            level > 0 && "ml-4"
          )}
        >
          <subgroup.icon className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1 text-left">{subgroup.name}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {isExpanded && (
          <div className="space-y-1 ml-2 border-l border-neutral-200 dark:border-neutral-700 pl-2">
            {subgroup.items.map((item: any) => (
              <SidebarItem key={item.name} item={item} collapsed={collapsed} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const SidebarGroup = ({ 
    group, 
    collapsed 
  }: { 
    group: any; 
    collapsed: boolean; 
  }) => {
    const isExpanded = expandedGroups.has(group.name);
    
    if (collapsed) {
      return (
        <div className="space-y-1">
          {group.items.map((subgroup: any) => (
            <SidebarSubGroup key={subgroup.name} subgroup={subgroup} collapsed={collapsed} />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleGroup(group.name)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <group.icon className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1 text-left">{group.name}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {isExpanded && (
          <div className="space-y-2 ml-2 border-l border-neutral-200 dark:border-neutral-700 pl-2">
            {group.items.map((subgroup: any) => (
              <SidebarSubGroup key={subgroup.name} subgroup={subgroup} collapsed={collapsed} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300",
          collapsed ? "w-16" : "w-72"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
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

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 p-4 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
          {navigation.map((item, index) => {
            if (item.type === "single") {
              // Single item (Dashboard)
              return (
                <SidebarItem key={item.name} item={item as { name: string; href: string; icon: any }} collapsed={collapsed} />
              );
            } else if (item.type === "group") {
              // Group item
              return (
                <SidebarGroup key={item.name} group={item} collapsed={collapsed} />
              );
            }
            return null;
          })}
        </nav>

        {/* Footer with Settings */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
          <div
            className={cn(
              "flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer",
              collapsed && "justify-center"
            )}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span>Settings</span>}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar (Slide-over) */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <h1 className="text-xl font-bold text-primary-1">KYC Admin</h1>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 p-4 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
              {navigation.map((item, index) => {
                if (item.type === "single") {
                  // Single item (Dashboard)
                  return (
                    <SidebarItem key={item.name} item={item as { name: string; href: string; icon: any }} collapsed={false} />
                  );
                } else if (item.type === "group") {
                  // Group item
                  return (
                    <SidebarGroup key={item.name} group={item} collapsed={false} />
                  );
                }
                return null;
              })}
            </nav>

            {/* Footer with Settings */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}