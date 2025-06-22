import { Request, Response } from "express";
import Category, { ICategory } from "../models/Category";
import cloudinary from "../utils/cloudinary";

/**
 * Extracts the public_id from a Cloudinary URL
 * @param url - The Cloudinary URL
 * @returns The public_id of the image
 */
const extractPublicIdFromUrl = (url: string): string | null => {
	try {
		// Parse the URL to extract the public_id
		const urlParts = url.split('/');
		const uploadIndex = urlParts.findIndex(part => part === 'upload');
		
		if (uploadIndex === -1) {
			console.error('Invalid Cloudinary URL format');
			return null;
		}
		
		// Get everything after 'upload' and before the file extension
		const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
		
		// Remove version prefix if present (e.g., v1234567890/)
		const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
		
		// Remove file extension
		const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, '');
		
		return publicId;
	} catch (error) {
		console.error('Error extracting public_id from URL:', error);
		return null;
	}
};

/**
 * Deletes an image from Cloudinary if it exists
 * @param imageUrl - The Cloudinary URL of the image to delete
 */
const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
	if (!imageUrl) return;
	
	const publicId = extractPublicIdFromUrl(imageUrl);
	if (!publicId) {
		console.warn('Could not extract public_id from image URL:', imageUrl);
		return;
	}

	try {
		const result = await cloudinary.uploader.destroy(publicId);
		console.log('Image deleted from Cloudinary:', publicId, result.result);
	} catch (error) {
		console.error('Error deleting image from Cloudinary:', error);
		// Don't throw error here as we don't want to fail the category update
		// if image deletion fails
	}
};

// Create a new category
export const createCategory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { name, description, image } = req.body;
		
		// Validate required fields
		if (!name) {
			res.status(400).json({ 
				message: "Category name is required" 
			});
			return;
		}

		// Generate slug from name
		const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

		// Check if category with same name or slug already exists
		const existingCategory = await Category.findOne({
			$or: [{ name }, { slug }]
		});

		if (existingCategory) {
			res.status(400).json({ 
				message: "Category with this name already exists" 
			});
			return;
		}

		const category = new Category({
			name,
			slug,
			description,
			image: image || ""
		});

		const savedCategory = await category.save();
		res.status(201).json(savedCategory);
	} catch (err: any) {
		console.error("Category creation error:", err);
		res.status(500).json({ 
			message: err.message || "Internal server error during category creation" 
		});
	}
};

// Get all categories
export const getAllCategories = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Extract pagination and search parameters from query string
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const search = req.query.search as string || "";
		
		// Calculate how many documents to skip for pagination
		// Example: page 1 = skip 0, page 2 = skip 10, page 3 = skip 20
		const skip = (page - 1) * limit;
		
		// Build MongoDB search query - search across name, description, and slug
		let searchQuery = {};
		if (search.trim()) {
			searchQuery = {
				$or: [
					{ name: { $regex: search, $options: 'i' } },        // Case-insensitive name search
					{ description: { $regex: search, $options: 'i' } }, // Case-insensitive description search
					{ slug: { $regex: search, $options: 'i' } }         // Case-insensitive slug search
				]
			};
		}
		
		// Get total count for pagination metadata (fast count query, doesn't fetch data)
		const totalCategories = await Category.countDocuments(searchQuery);
		const totalPages = Math.ceil(totalCategories / limit);
		
		// Fetch only the categories for current page with search filter
		const categories = await Category.find(searchQuery)
			.sort({ createdAt: -1 })  // Newest first
			.skip(skip)               // Skip previous pages
			.limit(limit);            // Only get 'limit' number of records
		
		// Return categories with pagination metadata for frontend
		res.json({
			categories,
			pagination: {
				currentPage: page,
				totalPages,
				totalCategories,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
				limit
			}
		});
	} catch (err: any) {
		console.error("Error fetching categories:", err);
		res.status(500).json({ 
			message: "Failed to fetch categories" 
		});
	}
};

// Get category by ID
export const getCategoryById = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const category = await Category.findById(id);
		
		if (!category) {
			res.status(404).json({ 
				message: "Category not found" 
			});
			return;
		}
		
		res.json(category);
	} catch (err: any) {
		console.error("Error fetching category:", err);
		res.status(500).json({ 
			message: "Failed to fetch category" 
		});
	}
};

// Update category
export const updateCategory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const { name, description, image } = req.body;
		
		const category = await Category.findById(id);
		
		if (!category) {
			res.status(404).json({ 
				message: "Category not found" 
			});
			return;
		}

		// If a new image is being uploaded and it's different from the current one,
		// delete the old image from Cloudinary to save storage
		if (image && image !== category.image && category.image) {
			await deleteImageFromCloudinary(category.image);
		}

		// Generate new slug if name is being updated
		let slug = category.slug;
		if (name && name !== category.name) {
			slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
			
			// Check if new slug already exists
			const existingCategory = await Category.findOne({ 
				slug, 
				_id: { $ne: id } 
			});
			
			if (existingCategory) {
				res.status(400).json({ 
					message: "Category with this name already exists" 
				});
				return;
			}
		}

		const updatedCategory = await Category.findByIdAndUpdate(
			id,
			{ name, slug, description, image },
			{ new: true, runValidators: true }
		);

		res.json(updatedCategory);
	} catch (err: any) {
		console.error("Category update error:", err);
		res.status(500).json({ 
			message: err.message || "Internal server error during category update" 
		});
	}
};

// Delete category
export const deleteCategory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		
		const category = await Category.findById(id);
		
		if (!category) {
			res.status(404).json({ 
				message: "Category not found" 
			});
			return;
		}

		// Delete the category image from Cloudinary if it exists
		if (category.image) {
			await deleteImageFromCloudinary(category.image);
		}

		await Category.findByIdAndDelete(id);
		
		res.json({ 
			message: "Category deleted successfully" 
		});
	} catch (err: any) {
		console.error("Category deletion error:", err);
		res.status(500).json({ 
			message: err.message || "Internal server error during category deletion" 
		});
	}
}; 