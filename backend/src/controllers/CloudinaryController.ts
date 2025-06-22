import { Request, Response } from "express";
import cloudinary from "../utils/cloudinary";

/**
 * Deletes an image from Cloudinary using the public_id
 * @param req - Express request object containing publicId in body
 * @param res - Express response object
 */
export const deleteImage = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { publicId } = req.body;

		// Validate that publicId is provided
		if (!publicId) {
			res.status(400).json({
				message: "publicId is required"
			});
			return;
		}

		// Delete the image from Cloudinary
		const result = await cloudinary.uploader.destroy(publicId);

		// Check if deletion was successful
		if (result.result === 'ok' || result.result === 'not found') {
			res.json({
				message: "Image deleted successfully",
				result: result.result
			});
		} else {
			res.status(500).json({
				message: "Failed to delete image from Cloudinary",
				result: result.result
			});
		}
	} catch (err: any) {
		console.error("Cloudinary delete error:", err);
		res.status(500).json({
			message: err.message || "Internal server error during image deletion"
		});
	}
}; 