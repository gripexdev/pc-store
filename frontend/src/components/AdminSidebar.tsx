import { Link, useLocation } from "react-router-dom";
import { useKeycloak } from "../context/KeycloakProvider";
import { 
  BarChart3, 
  Monitor, 
  FolderOpen, 
  Package, 
  Wrench, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const AdminSidebar = ({ isCollapsed, onToggleCollapse }: AdminSidebarProps) => {
  const location = useLocation();
  const { keycloak } = useKeycloak();
  const username = keycloak.tokenParsed?.preferred_username || "Admin";

  const sidebarItems: SidebarItem[] = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <BarChart3 size={20} />,
      description: "Overview & Analytics"
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: <Monitor size={20} />,
      description: "Manage PC Components",
      badge: "New"
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: <FolderOpen size={20} />,
      description: "Product Categories"
    },
    {
      name: "Inventory",
      path: "/admin/inventory",
      icon: <Package size={20} />,
      description: "Stock Management",
      badge: "Low Stock"
    },
    {
      name: "PC Builder",
      path: "/admin/pc-builder",
      icon: <Wrench size={20} />,
      description: "Custom PC Configs"
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <ShoppingCart size={20} />,
      description: "Order Management"
    },
    {
      name: "Customers",
      path: "/admin/customers",
      icon: <Users size={20} />,
      description: "User Management"
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: <TrendingUp size={20} />,
      description: "Sales & Reports"
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings size={20} />,
      description: "Store Configuration"
    }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("kc-redirected");
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <div className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    } min-h-screen fixed left-0 top-0 z-50`}>
      
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">PC Store</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{username}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "hover:bg-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-slate-300">
                    {item.description}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        {!isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar; 