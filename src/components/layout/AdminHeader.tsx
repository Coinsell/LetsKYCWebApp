import { Menu, Sun, Moon, Bell, User } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from "react-router-dom";

interface AdminHeaderProps {
  onOpenSidebar?: () => void; // only for mobile
}

export function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Sidebar Toggle */}
          {onOpenSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 lg:hidden"
              onClick={onOpenSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            KYC Administration
          </h2>
        </div>
        {/* Right side (unchanged) */}
        ...
      </div>
    </header>
  );
}
