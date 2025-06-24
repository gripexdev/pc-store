import { Router } from "express";
import { createProduct, getAllProducts, deleteProduct } from "../controllers/ProductController";

const router = Router();

// Route to create a new product
router.post("/", createProduct);

// Route to get all products (for dev/testing)
router.get("/", getAllProducts);

// Route to delete a product by ID
router.delete("/:id", deleteProduct);

export default router; 