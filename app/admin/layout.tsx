import React from "react";
import AdminNavbar from "@/components/admin/layout/navbar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <AdminNavbar />
      {children}
    </main>
  );
};

export default AdminLayout;
