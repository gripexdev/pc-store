import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dywfxoze6',
  api_key: process.env.CLOUDINARY_API_KEY || '813373448179351',
  api_secret: process.env.CLOUDINARY_API_SECRET || '_mKM53XQkM085MHEfV68ANfyV7U',
  secure: true,
});

export default cloudinary; 