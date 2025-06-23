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
 * Controller to get all products with pagination and search
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse query params for pagination and search
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    // Build filter for search (name, brand, description)
    const filter: any = {};
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Count total products matching filter
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;

    // Fetch products with pagination and populate category
    const products = await Product.find(filter)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages,
      totalProducts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit,
    };

    res.json({ products, pagination });
  } catch (err: any) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: err.message || "Failed to fetch products" });
  }
}; 