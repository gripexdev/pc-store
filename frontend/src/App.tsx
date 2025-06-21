import { Route, Routes } from "react-router-dom";
import "./App.css";
import AuthPanel from "./components/AuthPanel";
import { PrivateRoute } from "./routes/PrivateRoute";
import { UserRoute } from "./routes/UserRoute";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin";
import { AdminRoute } from "./routes/AdminRoute";
import Register from "./pages/Register";

function App() {
	return (
		<div>
			<header className="p-4 border-b bg-gray-100">
				<div className="container mx-auto flex justify-between items-center">
					<h1 className="text-xl font-bold">PC Store 🖥️</h1>
					<AuthPanel />
				</div>
			</header>

			{/* Your Routes below */}
			<Routes>
				<Route path="/" element={<Home />} />
        <Route 
					path="/register" 
					element={
						<UserRoute>
							<Register />
						</UserRoute>
					} 
				/>
				<Route
					path="/checkout"
					element={
						<PrivateRoute>
							<Checkout />
						</PrivateRoute>
					}
				/>
				<Route
					path="/admin"
					element={
						<AdminRoute>
							<AdminDashboard />
						</AdminRoute>
					}
				/>
				{/* <Route
					path="/admin/products"
					element={
						<AdminRoute>
							<AdminProducts />
						</AdminRoute>
					}
				/> */}
				{/* <Route
					path="/admin/orders"
					element={
						<AdminRoute>
							<AdminOrders />
						</AdminRoute>
					}
				/> */}
			</Routes>
		</div>
	);
}

export default App;
