// src/routes/authRoutes.ts
import { Router, Request, Response, NextFunction } from "express";
import { register } from "../controllers/AuthController";
import User from "../models/User";

const router = Router();

router.post("/register", (req: Request, res: Response, next: NextFunction) => {
  register(req, res).catch(next);
});

// Temporary route to list all users (for development only)
router.get("/all", async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-__v'); // Exclude version field
    res.json({ 
      count: users.length, 
      users: users 
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

export default router;
