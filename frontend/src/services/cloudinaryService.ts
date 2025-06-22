// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dywfxoze6';
// Update this to match your upload preset name from Cloudinary dashboard
const CLOUDINARY_UPLOAD_PRESET = 'pc-store-upload'; // Change this to your actual preset name

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export const uploadImageToCloudinary = async (file: File): Promise<CloudinaryUploadResponse> => {
  console.log('File details:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  });

  // Try unsigned upload first (without preset)
  try {
    console.log('Trying unsigned upload to Cloudinary...');
    return await uploadImageUnsigned(file);
  } catch (error) {
    console.error('Unsigned upload failed, trying with preset...', error);
    
    // Fallback to preset upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'pc-store/categories');

    console.log('Uploading to Cloudinary with preset:', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      console.log('Cloudinary response status:', response.status);
      console.log('Cloudinary response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Cloudinary error response:', errorData);
        
        // Try to parse as JSON for better error info
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
const uploadImageUnsigned = async (file: File): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'pc-store/categories');

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