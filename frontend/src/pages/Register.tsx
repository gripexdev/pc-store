import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useKeycloak } from "../context/KeycloakProvider";

interface FormData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

interface ValidationErrors {
	username?: string;
	email?: string;
	password?: string;
	confirmPassword?: string;
	submit?: string;
}

const Register = () => {

	const { keycloak } = useKeycloak();
	
	const [formData, setFormData] = useState<FormData>({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [success, setSuccess] = useState("");
	const [passwordStrength, setPasswordStrength] = useState({
		score: 0,
		label: "",
		color: "",
	});

	// Password strength calculation
	const calculatePasswordStrength = (password: string) => {
		let score = 0;
		let label = "";
		let color = "";

		if (password.length >= 8) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[0-9]/.test(password)) score++;
		if (/[^A-Za-z0-9]/.test(password)) score++;

		switch (score) {
			case 0:
			case 1:
				label = "Very Weak";
				color = "bg-red-500";
				break;
			case 2:
				label = "Weak";
				color = "bg-orange-500";
				break;
			case 3:
				label = "Fair";
				color = "bg-yellow-500";
				break;
			case 4:
				label = "Good";
				color = "bg-blue-500";
				break;
			case 5:
				label = "Strong";
				color = "bg-green-500";
				break;
		}

		return { score, label, color };
	};

	// Validation function
	const validateField = (name: string, value: string): string => {
		switch (name) {
			case "username":
				if (!value.trim()) return "Username is required";
				if (value.length < 3) return "Username must be at least 3 characters";
				if (value.length > 20) return "Username must be less than 20 characters";
				if (!/^[a-zA-Z0-9_]+$/.test(value)) {
					return "Username can only contain letters, numbers, and underscores";
				}
				break;
			case "email":
				if (!value.trim()) return "Email is required";
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
					return "Please enter a valid email address";
				}
				break;
			case "password":
				if (!value) return "Password is required";
				if (value.length < 8) return "Password must be at least 8 characters";
				if (!/(?=.*[a-z])/.test(value)) return "Password must contain at least one lowercase letter";
				if (!/(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase letter";
				if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number";
				break;
			case "confirmPassword":
				if (!value) return "Please confirm your password";
				if (value !== formData.password) return "Passwords do not match";
				break;
		}
		return "";
	};

	// Handle input changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));

		// Update password strength
		if (name === "password") {
			setPasswordStrength(calculatePasswordStrength(value));
		}

		// Validate field if it has been touched
		if (touched[name]) {
			const error = validateField(name, value);
			setErrors(prev => ({ ...prev, [name]: error }));
		}
	};

	// Handle blur events
	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setTouched(prev => ({ ...prev, [name]: true }));
		
		const error = validateField(name, value);
		setErrors(prev => ({ ...prev, [name]: error }));
	};

	// Validate entire form
	const validateForm = (): boolean => {
		const newErrors: ValidationErrors = {};
		Object.keys(formData).forEach(key => {
			const error = validateField(key, formData[key as keyof FormData]);
			if (error) newErrors[key as keyof ValidationErrors] = error;
		});
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Check if form is valid (all fields filled and no validation errors)
	const isFormValid = () => {
		// Check if all required fields are filled
		const allFieldsFilled = formData.username.trim() !== "" && 
			formData.email.trim() !== "" && 
			formData.password !== "" && 
			formData.confirmPassword !== "";
		
		// Check if there are no validation errors (excluding submit errors)
		const noValidationErrors = !errors.username && 
			!errors.email && 
			!errors.password && 
			!errors.confirmPassword;
		
		return allFieldsFilled && noValidationErrors;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSuccess("");

		// Mark all fields as touched
		setTouched({
			username: true,
			email: true,
			password: true,
			confirmPassword: true,
		});

		if (!validateForm()) {
			setIsSubmitting(false);
			return;
		}

		try {
			const res = await fetch("http://localhost:5000/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: formData.username,
					email: formData.email,
					password: formData.password,
				}),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || `Registration failed (${res.status})`);
			}

			setSuccess("✅ Account created successfully! Redirecting to login...");
			setFormData({ username: "", email: "", password: "", confirmPassword: "" });
			setErrors({});
			setTouched({});
			setPasswordStrength({ score: 0, label: "", color: "" });
			
			// Redirect to login after 2 seconds
			setTimeout(() => {
				// window.location.href = "/";
				keycloak.login();
			}, 2000);
		} catch (err: any) {
			console.error("Registration error:", err);
			setErrors({ submit: err.message || "An unexpected error occurred during registration" });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
			<div className="max-w-md w-full">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
					<p className="text-gray-600">Join us and start your journey today</p>
				</div>

				{/* Form Card */}
				<div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Username Field */}
						<div>
							<label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
								Username
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
								<input
									id="username"
									name="username"
									type="text"
									value={formData.username}
									onChange={handleChange}
									onBlur={handleBlur}
									className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
										errors.username ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
									}`}
									placeholder="Enter your username"
								/>
							</div>
							{errors.username && (
								<p className="mt-1 text-sm text-red-600 flex items-center">
									<svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
									</svg>
									{errors.username}
								</p>
							)}
						</div>

						{/* Email Field */}
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
								Email Address
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
									</svg>
								</div>
								<input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleChange}
									onBlur={handleBlur}
									className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
										errors.email ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
									}`}
									placeholder="Enter your email"
								/>
							</div>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600 flex items-center">
									<svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
									</svg>
									{errors.email}
								</p>
							)}
						</div>

						{/* Password Field */}
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
								</div>
								<input
									id="password"
									name="password"
									type="password"
									value={formData.password}
									onChange={handleChange}
									onBlur={handleBlur}
									className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
										errors.password ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
									}`}
									placeholder="Create a strong password"
								/>
							</div>
							
							{/* Password Strength Indicator */}
							{formData.password && (
								<div className="mt-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-gray-600">Password strength:</span>
										<span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
											{passwordStrength.label}
										</span>
									</div>
									<div className="mt-1 flex space-x-1">
										{[...Array(5)].map((_, i) => (
											<div
												key={i}
												className={`h-1 flex-1 rounded-full transition-colors ${
													i < passwordStrength.score ? passwordStrength.color : "bg-gray-200"
												}`}
											/>
										))}
									</div>
								</div>
							)}
							
							{errors.password && (
								<p className="mt-1 text-sm text-red-600 flex items-center">
									<svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
									</svg>
									{errors.password}
								</p>
							)}
						</div>

						{/* Confirm Password Field */}
						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
								Confirm Password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									value={formData.confirmPassword}
									onChange={handleChange}
									onBlur={handleBlur}
									className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
										errors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
									}`}
									placeholder="Confirm your password"
								/>
							</div>
							{errors.confirmPassword && (
								<p className="mt-1 text-sm text-red-600 flex items-center">
									<svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
									</svg>
									{errors.confirmPassword}
								</p>
							)}
						</div>

						{/* Submit Error */}
						{errors.submit && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<p className="text-sm text-red-600 flex items-center">
									<svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
									</svg>
									{errors.submit}
								</p>
							</div>
						)}

						{/* Success Message */}
						{success && (
							<div className="bg-green-50 border border-green-200 rounded-lg p-4">
								<p className="text-sm text-green-600 flex items-center">
									<svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									{success}
								</p>
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={!isFormValid() || isSubmitting}
							className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
								isFormValid() && !isSubmitting
									? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
									: "bg-gray-400 cursor-not-allowed"
							}`}
						>
							{isSubmitting ? (
								<div className="flex items-center justify-center">
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Creating Account...
								</div>
							) : (
								"Create Account"
							)}
						</button>
					</form>

					{/* Login Link */}
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Already have an account?{" "}
							<Link to="/" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
								Sign in here
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Register;
