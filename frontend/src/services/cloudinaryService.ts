// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dywfxoze6';
// Update this to match your upload preset name from Cloudinary dashboard
const DEFAULT_CLOUDINARY_UPLOAD_PRESET = 'pc-store-upload'; // For categories and general use
const PRODUCT_CLOUDINARY_UPLOAD_PRESET = 'pc-store-products-upload'; // For product images

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Extracts the public_id from a Cloudinary URL
 * @param url - The Cloudinary URL (e.g., https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg)
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
 * Deletes an image from Cloudinary using the image URL
 * @param imageUrl - The Cloudinary URL of the image to delete
 * @returns Promise that resolves when deletion is successful
 */
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
  const publicId = extractPublicIdFromUrl(imageUrl);
  
  if (!publicId) {
    throw new Error('Could not extract public_id from image URL');
  }

  // For security reasons, we'll need to make this request from the backend
  // since we don't want to expose the API secret in the frontend
  const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/cloudinary/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete image: ${response.status}`);
  }
};

export const uploadImageToCloudinary = async (file: File, folder: string, uploadPreset?: string): Promise<CloudinaryUploadResponse> => {
  // Use the provided preset or default
  const preset = uploadPreset || DEFAULT_CLOUDINARY_UPLOAD_PRESET;
  console.log('File details:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  });
  // Try unsigned upload first (without preset)
  try {
    console.log('Trying unsigned upload to Cloudinary...');
    return await uploadImageUnsigned(file, folder);
  } catch (error) {
    console.error('Unsigned upload failed, trying with preset...', error);
    // Fallback to preset upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);
    formData.append('folder', folder);
    console.log('Uploading to Cloudinary with preset:', preset, 'folder:', folder);
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Cloudinary error response:', errorData);
        try {
          const errorJson = JSON.parse(errorData);
          throw new Error(`Cloudinary upload failed: ${errorJson.error?.message || errorJson.error || response.statusText}`);
        } catch {
          throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText} - ${errorData}`);
        }
      }
      const data = await response.json();
      console.log('Cloudinary upload success:', data);
      return data;
    } catch (presetError) {
      console.error('Preset upload also failed:', presetError);
      throw presetError;
    }
  }
};

// Fallback method for unsigned uploads
const uploadImageUnsigned = async (file: File, folder: string): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  console.log('Trying unsigned upload to Cloudinary...');
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Unsigned upload also failed:', errorData);
      throw new Error(`Unsigned upload failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Unsigned upload success:', data);
    return data;
  } catch (error) {
    console.error('Unsigned upload error:', error);
    throw error;
  }
};

export const validateImageFile = (file: File): string | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'Please select an image file (JPEG, PNG, GIF, etc.)';
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'Image size must be less than 5MB';
  }

  return null;
}; 