import { Request, Response } from "express";
import { RegisterUserDto } from "../dtos/RegisterUserDto";
import { AuthService } from "../services/AuthService";
import User from "../models/User";

const authService = new AuthService();

export const register = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { username, email, password }: RegisterUserDto = req.body;
		
		// Validate required fields
		if (!username || !email || !password) {
			return res.status(400).json({ 
				message: "Missing required fields: username, email, and password are required" 
			});
		}

		const result = await authService.registerUser({
			username,
			email,
			password,
		});
		return res.status(201).json(result);
	} catch (err: any) {
		console.error("Registration error:", err);
		return res.status(500).json({ 
			message: err.message || "Internal server error during registration" 
		});
	}
};

export const getAllUsers = async (_req: Request, res: Response): Promise<Response> => {
	const users = await User.find();
	return res.json(users);
};
