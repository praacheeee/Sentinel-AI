import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, type UserProfile } from "./Sidebar";
import TopNavbar from "./TopNavbar";

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentUser: UserProfile = {
    name: "System Administrator",
    role: "Administrator",
    status: "online",
  };

  return (
    <div className="flex h-screen w-screen bg-[#0D1117] text-gray-200 overflow-hidden font-sans">
      <Sidebar
        collapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        user={currentUser}
        badges={{}}
      />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <TopNavbar user={currentUser} />

        <main className="flex-1 overflow-y-auto bg-[#0D1117] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;