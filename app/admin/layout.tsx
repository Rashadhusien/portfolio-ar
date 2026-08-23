"use client";

import React, { useState } from "react";
import AdminNavbar from "@/components/admin/layout/navbar";
import AdminSidebar from "@/components/admin/layout/sidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <AdminNavbar onMenuToggle={toggleSidebar} />
      <div className="flex relative">
        <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 min-h-0">
          <div className="p-4 lg:p-8">{children}</div>
        </div>
      </div>
    </main>
  );
};

export default AdminLayout;
