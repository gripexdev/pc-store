import AdminLayout from "../../components/AdminLayout";
import { Monitor, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminProducts = () => {
  
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Management</h1>
        <p className="text-gray-600">Manage your PC components and products inventory</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Products</h2>
          <button 
            onClick={() => navigate("/admin/products/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Monitor size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Products Management</h3>
          <p className="text-gray-600 mb-4">This page will contain your product management interface</p>
          <p className="text-sm text-gray-500">Features coming soon: Add, edit, delete products, manage categories, stock levels, and pricing</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts; 