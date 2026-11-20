import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Activity,
  User,
  Shield,
  
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
  user = { name: "System Administrator", role: "Lead Infrastructure Surveyor" },
  unreadNotificationsCount = 2,
  onSearchClick,
  onNotificationClick,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <TooltipProvider delayDuration={150}>
      <header
        className="
          flex items-center justify-between h-16 px-6 shrink-0 z-30 select-none
          backdrop-blur-xl bg-white/80 dark:bg-[#0B101D]/80
          border-b border-slate-200/80 dark:border-slate-800/80
          text-slate-700 dark:text-slate-200
          transition-colors duration-200
        "
        aria-label="Top Navigation Header"
      >
        {/* Breadcrumb & Project Tag */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span className="font-mono text-xs font-bold tracking-wider uppercase">
              Sentinel AI
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="font-semibold text-slate-900 dark:text-white">
              Pothole Vision Suite
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              v2.4
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <button
            onClick={onSearchClick}
            type="button"
            className="
              flex items-center gap-2.5 w-full px-3.5 py-1.5 rounded-lg
              bg-slate-100/70 dark:bg-slate-900/60
              border border-slate-200 dark:border-slate-800
              text-xs text-slate-500 dark:text-slate-400
              hover:border-slate-300 dark:hover:border-slate-700
              hover:text-slate-700 dark:hover:text-slate-300
              transition-all shadow-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500/30
            "
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            <span className="truncate">
              Search inspections, severity triage, road coordinates...
            </span>

            <span className="ml-auto flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono shadow-xs">
                Ctrl
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono shadow-xs">
                K
              </kbd>
            </span>
          </button>
        </div>

        {/* Right Telemetry & Actions */}
        <div className="flex items-center gap-3">
          {/* AI Inference Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>

            <Activity className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />

            <span>YOLOv8 Live Engine</span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  aria-label="Toggle visual theme"
                  className="
                    p-2 rounded-lg
                    text-slate-500 dark:text-slate-400
                    hover:text-slate-900 dark:hover:text-white
                    hover:bg-slate-100 dark:hover:bg-slate-800
                    border border-transparent hover:border-slate-200 dark:hover:border-slate-700
                    transition-all
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                  "
                >
                  {isDarkMode ? (
                    <Moon className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-slate-900 text-white text-xs font-medium border border-slate-800"
              >
                Switch to {isDarkMode ? "Light" : "Dark"} Mode
              </TooltipContent>
            </Tooltip>

            {/* Notification Bell */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={onNotificationClick}
                  aria-label="View notifications"
                  className="
                    relative p-2 rounded-lg
                    text-slate-500 dark:text-slate-400
                    hover:text-slate-900 dark:hover:text-white
                    hover:bg-slate-100 dark:hover:bg-slate-800
                    border border-transparent hover:border-slate-200 dark:hover:border-slate-700
                    transition-all
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                  "
                >
                  <Bell className="w-4 h-4" />

                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </span>
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-slate-900 text-white text-xs font-medium border border-slate-800"
              >
                {unreadNotificationsCount} Telemetry Alerts
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-1 py-1 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group">
            <Avatar className="w-7 h-7 border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                {user.name ? getInitials(user.name) : <User className="w-3.5 h-3.5" />}
              </AvatarFallback>
            </Avatar>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                {user.role || "Administrator"}
              </span>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default TopNavbar;
