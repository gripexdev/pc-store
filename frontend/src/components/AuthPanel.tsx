import { Link } from "react-router-dom";
import { useKeycloak } from "../context/KeycloakProvider";

const AuthPanel = () => {
	const { keycloak } = useKeycloak();

	const isLoggedIn = keycloak.authenticated;
	const username = keycloak.tokenParsed?.preferred_username;

	const handleLogout = () => {
		// Clear the redirect flag when logging out
		sessionStorage.removeItem("kc-redirected");
		keycloak.logout({ redirectUri: window.location.origin });
	};

	return (
		<div className="flex items-center justify-end gap-4 p-4 bg-white shadow-md rounded-lg">
			{!isLoggedIn ? (
				<div className="flex items-center gap-3">
					<button
						onClick={() => keycloak.login()}
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
					>
						Login
					</button>
					<Link
						to="/register"
						className="text-blue-600 text-sm hover:underline font-medium"
					>
						Register
					</Link>
				</div>
			) : (
				<div className="flex items-center gap-3">
					<span className="text-sm font-medium text-gray-700">
						👋 {username}
					</span>
					<button
						onClick={handleLogout}
						className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-medium transition"
					>
						Logout
					</button>
				</div>
			)}
		</div>
	);
};

export default AuthPanel;
