import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes"; // ✅ this path must be correct

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes); // ✅ Make sure this is not calling authRoutes()

app.get("/", (_req, res) => {
	res.send("API is running");
});

mongoose
	.connect(MONGO_URI)
	.then(() => {
		console.log("✅ MongoDB connected");
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error("❌ MongoDB connection error:", err);
	});
