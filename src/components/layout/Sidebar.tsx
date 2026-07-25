import React from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronLeft, ChevronRight, LogOut } from "lucide-react";

import { NAV_ITEMS, type NavItemConfig } from "../../constants/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl?: string;
  status?: "online" | "offline" | "busy";
}

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  user: UserProfile;
  badges?: Record<string, number | string>;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  user,
  badges = {},
  onLogout,
}) => {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? "80px" : "256px" }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative flex flex-col h-screen bg-[#161B22] border-r border-[#30363D] text-gray-300 select-none z-30"
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#30363D] overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#A8E6CF] shrink-0">
              <Shield className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#A8E6CF] animate-pulse" />
            </div>

            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col whitespace-nowrap overflow-hidden"
                >
                  <span className="text-sm font-bold tracking-wider text-white uppercase font-mono">
                    Sentinel <span className="text-[#A8E6CF]">AI</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                    Urban Intelligence Platform
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-20 z-40 flex items-center justify-center w-6 h-6 rounded-full bg-[#161B22] border border-[#30363D] text-gray-400 hover:text-white hover:border-[#A8E6CF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A8E6CF]"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item: NavItemConfig) => {
            const Icon = item.icon;
            const badgeValue = badges[item.id];

            const navLinkContent = (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center h-10 px-3 rounded-md text-sm font-medium transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] ${
                    isActive
                      ? "bg-[#A8E6CF]/10 text-white font-semibold"
                      : "text-gray-400 hover:bg-[#21262D] hover:text-gray-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Indicator Bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-5 rounded-r-full bg-[#A8E6CF]"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}

                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive
                          ? "text-[#A8E6CF]"
                          : "text-gray-400 group-hover:text-gray-200"
                      }`}
                    />

                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -5 }}
                          transition={{ duration: 0.15 }}
                          className="ml-3 truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Dynamic Notification Badge */}
                    {badgeValue !== undefined && badgeValue !== null && (
                      <div className="ml-auto flex items-center">
                        {!collapsed ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#A8E6CF]/20 text-[#A8E6CF] border border-[#A8E6CF]/30">
                            {badgeValue}
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#A8E6CF]" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{navLinkContent}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="bg-[#21262D] text-white border-[#30363D] font-medium text-xs"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <React.Fragment key={item.id}>{navLinkContent}</React.Fragment>;
          })}
        </nav>

        {/* Administrator Profile Section */}
        <div className="p-3 border-t border-[#30363D] bg-[#0D1117]/50">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#21262D] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative shrink-0">
                <Avatar className="w-8 h-8 border border-[#30363D] bg-[#21262D] text-[#A8E6CF]">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="bg-[#21262D] text-[#A8E6CF] text-xs font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {user.status === "online" && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#161B22]" />
                )}
              </div>

              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col truncate"
                  >
                    <span className="text-xs font-semibold text-white truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">
                      {user.role}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!collapsed && onLogout && (
              <button
                onClick={onLogout}
                aria-label="Log out"
                className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded focus:outline-none focus:ring-1 focus:ring-red-400"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default Sidebar;