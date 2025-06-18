import { useKeycloak } from "../context/KeycloakProvider";

const AuthPanel = () => {
	const { keycloak } = useKeycloak();

	const isLoggedIn = keycloak.authenticated;
	const username = keycloak.tokenParsed?.preferred_username;

	return (
		<div className="flex items-center justify-end gap-4 p-4 bg-white shadow-md rounded-lg">
			{!isLoggedIn ? (
				<button
					onClick={() => keycloak.login()}
					className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
				>
					Login
				</button>
			) : (
				<div className="flex items-center gap-3">
					<span className="text-sm font-medium text-gray-700">
						👋 {username}
					</span>
					<button
						onClick={() =>
							keycloak.logout({ redirectUri: window.location.origin })
						}
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
