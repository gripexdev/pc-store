import { Router } from "express";
import { createProduct, getAllProducts, deleteProduct, updateProduct, getProductById } from "../controllers/ProductController";

const router = Router();

// Route to create a new product
router.post("/", createProduct);

// Route to get all products with pagination and search
router.get("/", getAllProducts);

// Route to get a single product by ID
router.get("/:id", getProductById);

// Route to update a product by ID
router.put("/:id", updateProduct);

// Route to delete a product by ID
router.delete("/:id", deleteProduct);

export default router; 