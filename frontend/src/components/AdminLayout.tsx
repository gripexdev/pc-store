import { ReactNode, useState } from "react";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? "ml-16" : "ml-64"
      }`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout; 