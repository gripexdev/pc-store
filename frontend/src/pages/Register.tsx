import { useState } from "react";

const Register = () => {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		try {
			const res = await fetch("http://localhost:5000/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || `Registration failed (${res.status})`);
			}

			setSuccess("✅ Account created successfully!");
			setFormData({ username: "", email: "", password: "" });
		} catch (err: any) {
			console.error("Registration error:", err);
			setError(err.message || "An unexpected error occurred during registration");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
			<div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
				<h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
					Create an Account
				</h2>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<input
						name="username"
						type="text"
						placeholder="Username"
						required
						value={formData.username}
						onChange={handleChange}
						className="w-full border px-4 py-2 rounded-md focus:ring-2 ring-blue-500"
					/>

					<input
						name="email"
						type="email"
						placeholder="Email"
						required
						value={formData.email}
						onChange={handleChange}
						className="w-full border px-4 py-2 rounded-md focus:ring-2 ring-blue-500"
					/>

					<input
						name="password"
						type="password"
						placeholder="Password"
						required
						value={formData.password}
						onChange={handleChange}
						className="w-full border px-4 py-2 rounded-md focus:ring-2 ring-blue-500"
					/>

					<button
						type="submit"
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
					>
						Register
					</button>
				</form>

				{error && (
					<p className="text-red-500 text-sm mt-4 text-center">{error}</p>
				)}
				{success && (
					<p className="text-green-600 text-sm mt-4 text-center">{success}</p>
				)}
			</div>
		</div>
	);
};

export default Register;
