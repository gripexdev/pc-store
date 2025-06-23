import { Request, Response } from "express";
import Product from "../models/Product";

/**
 * Controller to create a new product
 * Validates required fields and saves the product to the database
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, brand, description, category, price, stock, featured, images } = req.body;

    // Validate required fields
    if (!name || !brand || !category || !price) {
      res.status(400).json({ message: "Missing required fields: name, brand, category, price" });
      return;
    }

    // Accept both single image (string) and array of images
    let imageArray: string[] = [];
    if (Array.isArray(images)) {
      imageArray = images;
    } else if (typeof images === "string" && images.trim() !== "") {
      imageArray = [images];
    }

    // Create new product instance
    const product = new Product({
      name,
      brand,
      description: description || "",
      category,
      price,
      stock: stock || 0,
      featured: featured || false,
      images: imageArray
    });

    // Save to database
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err: any) {
    console.error("Product creation error:", err);
    res.status(500).json({ message: err.message || "Internal server error during product creation" });
  }
};

/**
 * Controller to get all products (for development/testing)
 */
export const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (err: any) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: err.message || "Failed to fetch products" });
  }
}; 