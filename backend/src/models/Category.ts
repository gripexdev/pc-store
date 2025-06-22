import mongoose, { Schema, Document } from "mongoose";

// Category interface for TypeScript type checking
export interface ICategory extends Document {
	name: string; // Category name (e.g., "Graphics Cards")
	slug: string; // URL-friendly identifier (e.g., "graphics-cards")
	description: string; // Description of the category
	image: string; // Image URL or path for the category
	createdAt: Date; // Timestamp for when the category was created
	updatedAt: Date; // Timestamp for when the category was last updated
}

// Mongoose schema for the Category collection
const CategorySchema: Schema<ICategory> = new Schema(
	{
		// Name of the category (must be unique)
		name: { type: String, required: true, unique: true },
		// Slug for SEO-friendly URLs (must be unique)
		slug: { type: String, required: true, unique: true },
		// Optional description for the category
		description: { type: String },
		// Optional image URL or path for the category
		image: { type: String },
	},
	{
		// Automatically manage createdAt and updatedAt fields
		timestamps: true,
	}
);

// Create index for better query performance
CategorySchema.index({ slug: 1 });

// Export the Category model for use in the app
export default mongoose.model<ICategory>("Category", CategorySchema); 