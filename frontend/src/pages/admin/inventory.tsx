import AdminLayout from "../../components/AdminLayout";
import { Package, RefreshCw } from "lucide-react";

const AdminInventory = () => {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">Monitor stock levels and manage inventory</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Stock Overview</h2>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
            <RefreshCw size={16} />
            <span>Update Stock</span>
          </button>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Management</h3>
          <p className="text-gray-600 mb-4">This page will contain your inventory management interface</p>
          <p className="text-sm text-gray-500">Features coming soon: Stock levels, low stock alerts, restock notifications, inventory reports</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory; 