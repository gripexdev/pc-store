import { createUserInKeycloak } from "../utils/keycloakAdmin";
import { RegisterUserDto } from "../dtos/RegisterUserDto";
import User from "../models/User";

export class AuthService {
	async registerUser(data: RegisterUserDto) {
		const { username, email, password } = data;

		try {
			// Check if user already exists in local database
			const existingUser = await User.findOne({ 
				$or: [{ username }, { email }] 
			});
			
			if (existingUser) {
				throw new Error("User with this username or email already exists");
			}

			// Create in Keycloak first
			const keycloakUser = await createUserInKeycloak(username, email, password);

			// Store locally with the real Keycloak ID
			const newUser = new User({
				keycloakId: keycloakUser.id,
				username,
				email,
				role: "user",
			});

			await newUser.save();

			return { message: "User registered successfully", user: newUser };
		} catch (error: any) {
			console.error("AuthService registration error:", error);
			
			// Provide more specific error messages
			if (error.message.includes("already exists")) {
				throw error;
			}
			
			if (error.message.includes("Keycloak")) {
				throw new Error("Failed to create user in authentication service");
			}
			
			if (error.name === "ValidationError") {
				throw new Error("Invalid user data provided");
			}
			
			throw new Error("Registration failed. Please try again.");
		}
	}
}
