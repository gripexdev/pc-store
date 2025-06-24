import { Request, Response } from "express";
import Product from "../models/Product";
import cloudinary from "../utils/cloudinary";

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

/**
 * Controller to delete a product and its associated images from Cloudinary
 * @param req - Express request object containing product ID in params
 * @param res - Express response object
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate that product ID is provided
    if (!id) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    // Find the product first to get its images
    const product = await Product.findById(id);
    
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Delete associated images from Cloudinary if they exist
    if (product.images && product.images.length > 0) {
      // Extract public IDs from Cloudinary URLs and delete them
      const deletePromises = product.images.map(async (imageUrl: string) => {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = imageUrl.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          
          if (uploadIndex === -1) {
            console.warn('Invalid Cloudinary URL format:', imageUrl);
            return;
          }
          
          // Get everything after 'upload' and before the file extension
          const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
          
          // Remove version prefix if present (e.g., v1234567890/)
          const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
          
          // Remove file extension
          const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, '');
          
          // Delete from Cloudinary
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image ${publicId} from Cloudinary:`, result.result);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
          // Continue with other images even if one fails
        }
      });

      // Wait for all image deletions to complete
      await Promise.all(deletePromises);
    }

    // Delete the product from the database
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({ 
      message: "Product deleted successfully",
      deletedProduct 
    });
  } catch (err: any) {
    console.error("Product deletion error:", err);
    res.status(500).json({ message: err.message || "Internal server error during product deletion" });
  }
};

/**
 * Controller to update a product and manage image deletion from Cloudinary
 * @param req - Express request object containing product ID in params and update data in body
 * @param res - Express response object
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, brand, description, category, price, stock, featured, images } = req.body;

    // Validate that product ID is provided
    if (!id) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    // Find the existing product to get current images
    const existingProduct = await Product.findById(id);
    
    if (!existingProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Validate required fields
    if (!name || !brand || !category || !price) {
      res.status(400).json({ message: "Missing required fields: name, brand, category, price" });
      return;
    }

    // Process images array - accept both single image (string) and array of images
    let newImageArray: string[] = [];
    if (Array.isArray(images)) {
      newImageArray = images;
    } else if (typeof images === "string" && images.trim() !== "") {
      newImageArray = [images];
    }

    // Check if images have changed and delete old images from Cloudinary
    if (existingProduct.images && existingProduct.images.length > 0) {
      // Get the first image from both arrays for comparison
      const oldFirstImage = existingProduct.images[0];
      const newFirstImage = newImageArray[0];

      // If the first image has changed, delete the old one from Cloudinary
      if (oldFirstImage && newFirstImage && oldFirstImage !== newFirstImage) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = oldFirstImage.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          
          if (uploadIndex !== -1) {
            // Get everything after 'upload' and before the file extension
            const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
            
            // Remove version prefix if present (e.g., v1234567890/)
            const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
            
            // Remove file extension
            const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, '');
            
            // Delete from Cloudinary
            const result = await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted old image ${publicId} from Cloudinary:`, result.result);
          }
        } catch (error) {
          console.error('Error deleting old image from Cloudinary:', error);
          // Continue with update even if image deletion fails
        }
      }
    }

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        brand,
        description: description || "",
        category,
        price,
        stock: stock || 0,
        featured: featured || false,
        images: newImageArray
      },
      { new: true, runValidators: true }
    ).populate('category');

    if (!updatedProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(updatedProduct);
  } catch (err: any) {
    console.error("Product update error:", err);
    res.status(500).json({ message: err.message || "Internal server error during product update" });
  }
};

/**
 * Controller to get a single product by ID
 * @param req - Express request object containing product ID in params
 * @param res - Express response object
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate that product ID is provided
    if (!id) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    // Find the product and populate the category
    const product = await Product.findById(id).populate('category');
    
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (err: any) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: err.message || "Failed to fetch product" });
  }
}; 