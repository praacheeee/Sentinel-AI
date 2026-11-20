import React from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Cpu,
} from "lucide-react";

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
    <TooltipProvider delayDuration={100}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? "74px" : "260px" }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="
          relative flex flex-col h-screen shrink-0
          bg-white dark:bg-[#0B101D]
          border-r border-slate-200 dark:border-slate-800/80
          text-slate-700 dark:text-slate-300
          select-none z-30 transition-colors
        "
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800/80 overflow-hidden">
          <div className="flex items-center gap-3">
            <div
              className="
                relative flex items-center justify-center
                w-10 h-10 rounded-xl shrink-0
                bg-gradient-to-br from-emerald-500/20 to-teal-500/10
                border border-emerald-500/30
                text-emerald-500 dark:text-emerald-400
                shadow-xs
              "
            >
              <Shield className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tracking-wider text-slate-900 dark:text-white uppercase font-mono">
                      Sentinel
                    </span>
                    <span className="text-xs px-1.5 py-0.2 rounded font-bold font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      AI
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                    Pothole Vision System
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
          className="
            absolute -right-3 top-20 z-40
            flex items-center justify-center
            w-6 h-6 rounded-full
            bg-white dark:bg-[#0E1524]
            border border-slate-300 dark:border-slate-700
            text-slate-600 dark:text-slate-300
            hover:text-emerald-600 dark:hover:text-emerald-400
            hover:border-emerald-500 dark:hover:border-emerald-500
            transition-all shadow-sm cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-emerald-500/30
          "
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
            const badgeValue = badges[item.id] || item.badge;

            const navLinkContent = (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center h-10 px-3 rounded-lg text-sm font-medium transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActiveGlow"
                        className="absolute left-0 w-1 h-5 rounded-r-full bg-emerald-500"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}

                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
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

                    {badgeValue && (
                      <div className="ml-auto flex items-center">
                        {!collapsed ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {badgeValue}
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
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
                  <TooltipTrigger asChild>
                    {navLinkContent}
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="bg-slate-900 text-white border-slate-800 font-medium text-xs shadow-md"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <React.Fragment key={item.id}>
                {navLinkContent}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Live Model Telemetry Pill (when expanded) */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="font-mono text-[10px] uppercase font-semibold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-500" />
                Active Model
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              YOLOv8 Nano (best.pt)
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Filtered: Potholes Only (ID 3)
            </div>
          </div>
        )}

        {/* User Profile Card */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B101D]">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative shrink-0">
                <Avatar className="w-8 h-8 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                {user.status === "online" && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B101D]" />
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
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
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
                className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded"
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
