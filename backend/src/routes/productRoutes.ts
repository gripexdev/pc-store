import { Router } from "express";
import { createProduct, getAllProducts, deleteProduct, updateProduct, getProductById, getProductsByCategory } from "../controllers/ProductController";

const router = Router();

// Route to create a new product
router.post("/", createProduct);

// Route to get all products with pagination and search
router.get("/", getAllProducts);

// Route to get products by category with pagination and search
// This endpoint allows filtering products by a specific category ID
// Supports query parameters: page, limit, and search
// Example: GET /api/products/category/507f1f77bcf86cd799439011?page=1&limit=12&search=gaming
router.get("/category/:categoryId", getProductsByCategory);

// Route to get a single product by ID
router.get("/:id", getProductById);

// Route to update a product by ID
router.put("/:id", updateProduct);

// Route to delete a product by ID
router.delete("/:id", deleteProduct);

export default router; 