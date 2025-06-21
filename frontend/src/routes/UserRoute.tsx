import { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useKeycloak } from "../context/KeycloakProvider";

export const UserRoute = ({ children }: { children: JSX.Element }) => {
	const { keycloak } = useKeycloak();

	// If user is authenticated, redirect them based on their role
	if (keycloak.authenticated) {
		const roles = keycloak.tokenParsed?.realm_access?.roles || [];
		const target = roles.includes("admin") ? "/admin" : "/";
		return <Navigate to={target} replace />;
	}

	return children;
}; 