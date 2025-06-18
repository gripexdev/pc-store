import { useKeycloak } from "../../context/KeycloakProvider";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
	const { keycloak } = useKeycloak();
	const username = keycloak.tokenParsed?.preferred_username || "Admin";

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<h1 className="text-3xl font-bold text-gray-800 mb-2">
				Welcome, {username}
			</h1>
			<p className="text-gray-600 mb-6">You're in the Admin Dashboard</p>

			<div className="grid gap-4 grid-cols-1 md:grid-cols-3">
				<Link
					to="/admin/products"
					className="bg-white shadow hover:shadow-md p-4 rounded border border-gray-200 hover:border-blue-400 transition"
				>
					<h2 className="text-xl font-semibold text-blue-600 mb-2">
						Manage Products
					</h2>
					<p className="text-sm text-gray-500">Add, edit, or delete products</p>
				</Link>

				<Link
					to="/admin/orders"
					className="bg-white shadow hover:shadow-md p-4 rounded border border-gray-200 hover:border-blue-400 transition"
				>
					<h2 className="text-xl font-semibold text-blue-600 mb-2">
						View Orders
					</h2>
					<p className="text-sm text-gray-500">
						Check order history and details
					</p>
				</Link>

				<Link
					to="/admin/users"
					className="bg-white shadow hover:shadow-md p-4 rounded border border-gray-200 hover:border-blue-400 transition"
				>
					<h2 className="text-xl font-semibold text-blue-600 mb-2">
						Manage Users
					</h2>
					<p className="text-sm text-gray-500">View and control user access</p>
				</Link>
			</div>
		</div>
	);
};

export default AdminDashboard;
