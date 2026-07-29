import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Activity,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface UserProfile {
  name: string;
  role?: string;
  avatarUrl?: string;
}

export interface TopNavbarProps {
  user?: UserProfile;
  unreadNotificationsCount?: number;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  user = { name: "System Administrator" },
  unreadNotificationsCount = 3,
  onSearchClick,
  onNotificationClick,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <TooltipProvider delayDuration={100}>
      <header
        className="flex items-center justify-between h-16 px-6 bg-[#161B22] border-b border-[#30363D] text-gray-200 shrink-0 z-20 select-none"
        aria-label="Top Navigation Header"
      >
        {/* Left Side: Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-white tracking-wide font-mono uppercase text-xs">
            Sentinel <span className="text-[#A8E6CF]">AI</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span className="text-[#A8E6CF] font-medium text-xs tracking-tight">
            Urban Operations
          </span>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-8 hidden sm:block">
          <button
            onClick={onSearchClick}
            type="button"
            className="flex items-center gap-2.5 w-full px-3.5 py-1.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-xs text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-[#A8E6CF]/50"
          >
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">Search incidents, zones, telemetry...</span>
            <span className="ml-auto flex items-center gap-0.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[#21262D] text-[10px] text-gray-400 border border-[#30363D] font-mono">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[#21262D] text-[10px] text-gray-400 border border-[#30363D] font-mono">
                K
              </kbd>
            </span>
          </button>
        </div>

        {/* Right Side: AI Status & Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* AI Telemetry Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>YOLOv8 Active</span>
          </div>

          <div className="h-4 w-px bg-[#30363D] hidden lg:block" />


          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle Placeholder */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  aria-label="Toggle visual theme"
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A8E6CF]"
                >
                  {isDarkMode ? (
                    <Moon className="w-4 h-4 text-gray-300" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-[#21262D] text-white border-[#30363D] text-xs font-medium"
              >
                Theme ({isDarkMode ? "Dark" : "Light"})
              </TooltipContent>
            </Tooltip>

            {/* Notification Bell */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onNotificationClick}
                  aria-label="View notifications"
                  className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A8E6CF]"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8E6CF] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A8E6CF]" />
                    </span>
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-[#21262D] text-white border-[#30363D] text-xs font-medium"
              >
                {unreadNotificationsCount} unread alerts
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-4 w-px bg-[#30363D]" />

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <Avatar className="w-8 h-8 border border-[#30363D] bg-[#21262D] text-[#A8E6CF] transition-colors group-hover:border-[#A8E6CF]">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-[#21262D] text-[#A8E6CF] text-xs font-semibold">
                {user.name ? getInitials(user.name) : <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default TopNavbar;