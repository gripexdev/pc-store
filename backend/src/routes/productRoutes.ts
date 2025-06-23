import { Router } from "express";
import { createProduct, getAllProducts } from "../controllers/ProductController";

const router = Router();

// Route to create a new product
router.post("/", createProduct);

// Route to get all products (for dev/testing)
router.get("/", getAllProducts);

export default router; 