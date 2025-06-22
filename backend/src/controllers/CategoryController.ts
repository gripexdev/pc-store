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
	_req: Request,
	res: Response
): Promise<void> => {
	try {
		const categories = await Category.find().sort({ createdAt: -1 });
		res.json(categories);
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