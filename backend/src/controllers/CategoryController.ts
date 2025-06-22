import { Request, Response } from "express";
import Category, { ICategory } from "../models/Category";

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