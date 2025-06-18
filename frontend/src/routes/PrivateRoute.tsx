// import { Navigate } from "react-router-dom";
import { JSX } from "react";
import { useKeycloak } from "../context/KeycloakProvider";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
	const { keycloak } = useKeycloak();

	if (!keycloak.authenticated) {
		keycloak.login();
		return <div>Redirecting to login...</div>;
	}

	return children;
};
