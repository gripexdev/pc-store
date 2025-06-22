import { useKeycloak } from "../../context/KeycloakProvider";
import AdminLayout from "../../components/AdminLayout";
import { 
	Monitor, 
	AlertTriangle, 
	ShoppingCart, 
	DollarSign, 
	Plus, 
	Package, 
	Wrench,
	BarChart3,
	TrendingUp,
	AlertCircle,
	CheckCircle,
	Info
} from "lucide-react";

const AdminDashboard = () => {
	const { keycloak } = useKeycloak();
	const username = keycloak.tokenParsed?.preferred_username || "Admin";

	// Mock data - replace with actual API calls
	const stats = {
		totalProducts: 1247,
		lowStockItems: 23,
		outOfStock: 8,
		totalOrders: 156,
		pendingOrders: 12,
		totalRevenue: 45678,
		monthlyGrowth: 12.5
	};

	const recentActivities = [
		{ id: 1, type: "product", action: "Added new RTX 4080", time: "2 hours ago", status: "success" },
		{ id: 2, type: "stock", action: "Low stock alert: DDR5 RAM", time: "4 hours ago", status: "warning" },
		{ id: 3, type: "order", action: "New order #1234 received", time: "6 hours ago", status: "info" },
		{ id: 4, type: "category", action: "Updated GPU category", time: "1 day ago", status: "success" }
	];

	const quickActions = [
		{ name: "Add Product", icon: <Plus size={24} />, path: "/admin/products", color: "blue" },
		{ name: "Check Inventory", icon: <Package size={24} />, path: "/admin/inventory", color: "green" },
		{ name: "View Orders", icon: <ShoppingCart size={24} />, path: "/admin/orders", color: "purple" },
		{ name: "PC Builder", icon: <Wrench size={24} />, path: "/admin/pc-builder", color: "orange" }
	];

	return (
		<AdminLayout>
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Welcome back, {username}! 👋
				</h1>
				<p className="text-gray-600">
					Here's what's happening with your PC Store today
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Products</p>
							<p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
						</div>
						<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
							<Monitor size={24} className="text-blue-600" />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Low Stock Items</p>
							<p className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</p>
						</div>
						<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
							<AlertTriangle size={24} className="text-orange-600" />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Pending Orders</p>
							<p className="text-2xl font-bold text-purple-600">{stats.pendingOrders}</p>
						</div>
						<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
							<ShoppingCart size={24} className="text-purple-600" />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
							<p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
						</div>
						<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
							<DollarSign size={24} className="text-green-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="mb-8">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{quickActions.map((action) => (
						<a
							key={action.name}
							href={action.path}
							className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
						>
							<div className="flex items-center space-x-4">
								<div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center group-hover:bg-${action.color}-200 transition-colors`}>
									<div className={`text-${action.color}-600`}>
										{action.icon}
									</div>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
										{action.name}
									</h3>
									<p className="text-sm text-gray-500">Quick access</p>
								</div>
							</div>
						</a>
					))}
				</div>
			</div>

			{/* Recent Activity & Stock Alerts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Recent Activity */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
					<div className="space-y-4">
						{recentActivities.map((activity) => (
							<div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
								<div className={`w-8 h-8 rounded-full flex items-center justify-center ${
									activity.status === 'success' ? 'bg-green-100' :
									activity.status === 'warning' ? 'bg-orange-100' :
									'bg-blue-100'
								}`}>
									{activity.type === 'product' ? (
										<Monitor size={16} className={activity.status === 'success' ? 'text-green-600' : 'text-blue-600'} />
									) : activity.type === 'stock' ? (
										<Package size={16} className="text-orange-600" />
									) : activity.type === 'order' ? (
										<ShoppingCart size={16} className="text-blue-600" />
									) : (
										<BarChart3 size={16} className="text-green-600" />
									)}
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-900">{activity.action}</p>
									<p className="text-xs text-gray-500">{activity.time}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Stock Alerts */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Alerts</h2>
					<div className="space-y-4">
						<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
							<div className="flex items-center space-x-3">
								<AlertCircle size={20} className="text-red-500" />
								<div>
									<p className="font-medium text-red-800">Out of Stock</p>
									<p className="text-sm text-red-600">{stats.outOfStock} items need restocking</p>
								</div>
							</div>
						</div>
						<div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
							<div className="flex items-center space-x-3">
								<AlertTriangle size={20} className="text-orange-500" />
								<div>
									<p className="font-medium text-orange-800">Low Stock</p>
									<p className="text-sm text-orange-600">{stats.lowStockItems} items running low</p>
								</div>
							</div>
						</div>
						<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
							<div className="flex items-center space-x-3">
								<TrendingUp size={20} className="text-green-500" />
								<div>
									<p className="font-medium text-green-800">Growth</p>
									<p className="text-sm text-green-600">+{stats.monthlyGrowth}% this month</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminDashboard;
