import mongoose, { Schema, Document } from "mongoose";

// Product interface for TypeScript type checking
export interface IProduct extends Document {
	name: string; // Product name (e.g., "NVIDIA RTX 4090")
	brand: string; // Brand of the product (e.g., "NVIDIA")
	description: string; // Description of the product
	category: mongoose.Types.ObjectId; // Reference to the Category model
	price: number; // Product price
	stock: number; // Number of items in stock
	images: string[]; // Array of image URLs or paths for the product
	featured: boolean; // Whether the product is featured
	createdAt: Date; // Timestamp for when the product was created
	updatedAt: Date; // Timestamp for when the product was last updated
}

// Mongoose schema for the Product collection
const ProductSchema: Schema<IProduct> = new Schema(
	{
		// Name of the product
		name: { type: String, required: true },
		// Brand of the product
		brand: { type: String, required: true },
		// Optional description for the product
		description: { type: String },
		// Reference to the category (must be a valid Category ObjectId)
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		// Price of the product
		price: { type: Number, required: true },
		// Stock quantity (default: 0)
		stock: { type: Number, default: 0 },
		// Array of image URLs or paths
		images: [{ type: String }],
		// Whether the product is featured (default: false)
		featured: { type: Boolean, default: false },
	},
	{
		// Automatically manage createdAt and updatedAt fields
		timestamps: true,
	}
);

// Export the Product model for use in the app
export default mongoose.model<IProduct>("Product", ProductSchema); 