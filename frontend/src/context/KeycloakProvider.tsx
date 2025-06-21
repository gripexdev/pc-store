import Keycloak from "keycloak-js";
import {
	ReactNode,
	useEffect,
	useState,
	createContext,
	useContext,
} from "react";

const keycloak = new Keycloak({
	url: "http://localhost:8080",
	realm: "pcstore",
	clientId: "pcstore-client",
});

interface AuthContextType {
	keycloak: Keycloak;
	initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useKeycloak = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("Keycloak context not found");
	return ctx;
};

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		const alreadyRedirected = sessionStorage.getItem("kc-redirected");
	
		keycloak
			.init({
				onLoad: "check-sso",
				pkceMethod: "S256",
				silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
			})
			.then((authenticated) => {
				if (authenticated && !alreadyRedirected) {
					const roles = keycloak.tokenParsed?.realm_access?.roles || [];
					const currentPath = window.location.pathname;
	
					const isReturningFromKeycloak =
						currentPath === "/" || currentPath.includes("/auth") || currentPath.includes("/callback");
	
					const target = roles.includes("admin") ? "/admin" : "/";
	
					// ✅ Always redirect after first login
					if (isReturningFromKeycloak || !document.referrer.includes(window.location.origin)) {
						sessionStorage.setItem("kc-redirected", "true");
						window.location.replace(target);
					}
				}
	
				setInitialized(true);
			})
			.catch(() => setInitialized(true));
	}, []);
	


	if (!initialized) return <div>Loading auth...</div>;

	return (
		<AuthContext.Provider value={{ keycloak, initialized }}>
			{children}
		</AuthContext.Provider>
	);
};
