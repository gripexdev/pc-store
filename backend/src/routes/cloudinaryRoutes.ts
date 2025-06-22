import express from "express";
import { deleteImage } from "../controllers/CloudinaryController";

const router = express.Router();

/**
 * DELETE /api/cloudinary/delete
 * Deletes an image from Cloudinary using the public_id
 * Body: { publicId: string }
 */
router.post("/delete", deleteImage);

export default router; 