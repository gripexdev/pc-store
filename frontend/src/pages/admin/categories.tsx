import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { FolderOpen, Plus } from "lucide-react";

const AdminCategories = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories Management</h1>
        <p className="text-gray-600">Organize your products into categories</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Product Categories</h2>
          <button 
            onClick={() => navigate("/admin/category/new")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={32} className="text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Categories Management</h3>
          <p className="text-gray-600 mb-4">This page will contain your category management interface</p>
          <p className="text-sm text-gray-500">Features coming soon: Create, edit, delete categories, organize products, category hierarchy</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories; 