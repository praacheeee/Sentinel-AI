import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, type UserProfile } from "./Sidebar";
import TopNavbar from "./TopNavbar";

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentUser: UserProfile = {
    name: "System Administrator",
    role: "Lead Infrastructure Surveyor",
    status: "online",
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
      <Sidebar
        collapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        user={currentUser}
        badges={{}}
      />

      <div className="flex flex-col flex-1 h-full overflow-hidden relative">
        {/* Subtle Ambient Background Glow in Dark Mode */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 dark:opacity-40">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <TopNavbar user={currentUser} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
