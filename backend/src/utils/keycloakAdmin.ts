import axios from 'axios';

interface KeycloakUser {
	id: string;
	username: string;
	email: string;
	enabled: boolean;
}

interface KeycloakRole {
	id: string;
	name: string;
}

export async function createUserInKeycloak(
	username: string,
	email: string,
	password: string
): Promise<KeycloakUser> {
	try {
		const baseUrl = "http://keycloak:8080";
		const realm = "pcstore";
		const adminUsername = process.env.KEYCLOAK_ADMIN || "admin";
		const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD || "admin";

		// Step 1: Get admin access token
		const tokenResponse = await axios.post(`${baseUrl}/realms/master/protocol/openid-connect/token`, 
			new URLSearchParams({
				username: adminUsername,
				password: adminPassword,
				grant_type: 'password',
				client_id: 'admin-cli'
			}), {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}
		);

		const accessToken = tokenResponse.data.access_token;

		// Step 2: Create user
		const userData = {
			username,
			email,
			enabled: true,
			emailVerified: true,
			credentials: [{
				type: 'password',
				value: password,
				temporary: false
			}]
		};

		const createUserResponse = await axios.post(
			`${baseUrl}/admin/realms/${realm}/users`,
			userData,
			{
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				}
			}
		);

		// Get the user ID from the Location header
		const locationHeader = createUserResponse.headers.location;
		const userId = locationHeader.split('/').pop();

		if (!userId) {
			throw new Error('Failed to get user ID from Keycloak response');
		}

		// Step 3: Get user roles and assign 'user' role
		try {
			const rolesResponse = await axios.get(
				`${baseUrl}/admin/realms/${realm}/roles`,
				{
					headers: {
						'Authorization': `Bearer ${accessToken}`,
						'Content-Type': 'application/json'
					}
				}
			);

			const userRole = rolesResponse.data.find((role: KeycloakRole) => role.name === 'user');
			
			if (userRole) {
				await axios.post(
					`${baseUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
					[{ id: userRole.id, name: userRole.name }],
					{
						headers: {
							'Authorization': `Bearer ${accessToken}`,
							'Content-Type': 'application/json'
						}
					}
				);
			}
		} catch (roleError) {
			console.warn('Could not assign user role:', roleError);
			// Continue even if role assignment fails
		}

		return {
			id: userId,
			username,
			email,
			enabled: true
		};

	} catch (error: any) {
		console.error('Keycloak user creation error:', error);
		
		if (error.response) {
			const status = error.response.status;
			const data = error.response.data;
			
			if (status === 409) {
				throw new Error('User already exists in Keycloak');
			}
			
			if (status === 401) {
				throw new Error('Keycloak authentication failed - check admin credentials');
			}
			
			throw new Error(`Keycloak error (${status}): ${data?.errorMessage || data?.error || 'Unknown error'}`);
		}
		
		throw new Error(`Keycloak error: ${error.message}`);
	}
}
