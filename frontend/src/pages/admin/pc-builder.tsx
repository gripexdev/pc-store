import AdminLayout from "../../components/AdminLayout";
import { Wrench, Plus } from "lucide-react";

const AdminPCBuilder = () => {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PC Builder Management</h1>
        <p className="text-gray-600">Manage custom PC configurations and presets</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">PC Configurations</h2>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
            <Wrench size={16} />
            <span>Create Config</span>
          </button>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench size={32} className="text-orange-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">PC Builder Management</h3>
          <p className="text-gray-600 mb-4">This page will contain your PC builder management interface</p>
          <p className="text-sm text-gray-500">Features coming soon: Create preset configurations, manage compatibility rules, custom builds, pricing templates</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPCBuilder; 