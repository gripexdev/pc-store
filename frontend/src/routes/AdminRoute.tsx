import { JSX } from "react";
import { useKeycloak } from "../context/KeycloakProvider";

export const AdminRoute = ({ children }: { children: JSX.Element }) => {
	const { keycloak } = useKeycloak();
	const roles = keycloak.tokenParsed?.realm_access?.roles || [];

	if (!keycloak.authenticated) {
		keycloak.login();
		return <div>Redirecting to login...</div>;
	}

	if (!roles.includes("admin")) {
		return (
			<div className="p-6 text-red-500">⛔ Access Denied. Admins only.</div>
		);
	}

	return children;
};
