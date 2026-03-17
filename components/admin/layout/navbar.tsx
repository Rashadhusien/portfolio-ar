import React from "react";
import AdminSidebar from "./sidebar";
import { auth } from "@/auth";

const AdminNavbar = async () => {
  const session = await auth();

  return (
    <div className="container mx-auto flex justify-between p-4">
      <h1>{session?.user?.name}'s Dashboard</h1>
      <AdminSidebar />
    </div>
  );
};

export default AdminNavbar;
