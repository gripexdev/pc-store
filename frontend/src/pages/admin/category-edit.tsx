import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { ArrowLeft, Save, X, Image as ImageIcon } from "lucide-react";
import { uploadImageToCloudinary, validateImageFile, deleteImageFromCloudinary } from "../../services/cloudinaryService";
import { categoryService, Category } from "../../services/categoryService";

// Main component for editing an existing category
const CategoryEdit = () => {
  // Initialize navigation and route parameters
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Refs for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state management
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: ""
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
    image: "",
  });
  
  // UI state management
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [originalImage, setOriginalImage] = useState<string>("");
  const [hasImageChanged, setHasImageChanged] = useState(false);

  // Load category data on component mount
  useEffect(() => {
    if (id) {
      loadCategoryData();
    }
  }, [id]);

  // Cleanup function to revoke object URLs and prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Loads the existing category data from the API
   */
  const loadCategoryData = async () => {
    try {
      setIsInitialLoading(true);
      setError("");
      
      const category = await categoryService.getCategoryById(id!);
      
      // Populate form with existing data
      setFormData({
        name: category.name,
        description: category.description || "",
        image: category.image || ""
      });
      
      // Store original image URL for comparison
      setOriginalImage(category.image || "");
      
      // Set preview URL to existing image
      if (category.image) {
        setPreviewUrl(category.image);
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to load category data");
    } finally {
      setIsInitialLoading(false);
    }
  };

  /**
   * Validates a single form field and updates the error state
   * @param name - Field name to validate
   * @param value - Field value to validate
   * @returns Error message if validation fails, empty string if valid
   */
  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "name":
        if (value.trim().length > 0 && value.trim().length < 3) {
          error = "Category name must be at least 3 characters long.";
        } else if (value.trim().length > 50) {
          error = "Category name must be less than 50 characters long.";
        }
        break;
      case "description":
        if (value.length > 500) {
          error = "Description must be less than 500 characters long.";
        }
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  /**
   * Handles changes for text inputs and textareas, updating form data and triggering validation
   * @param e - Change event from input/textarea
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  /**
   * Processes a selected image file, validates it, and initiates the upload to Cloudinary
   * @param file - The selected image file
   */
  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError("");
    setFormErrors(prev => ({...prev, image: ""})); // Clear image error on select
    
    // Create preview URL immediately for better UX
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setHasImageChanged(true);

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      console.log('Uploading new image to Cloudinary:', file.name, file.type, file.size);
      const result = await uploadImageToCloudinary(file);
      console.log('Upload successful:', result.secure_url);
      setFormData(prev => ({
        ...prev,
        image: result.secure_url
      }));
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(`Image upload failed: ${err.message}. Please try again.`);
      // Revert preview URL on upload failure
      setPreviewUrl(originalImage);
      setHasImageChanged(false);
    } finally {
      setIsUploading(false);
    }
  }, [originalImage]);

  /**
   * Manages the drag-and-drop UI state when a file is dragged over the drop zone
   * @param e - Drag event
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  /**
   * Handles the file drop event, triggering file selection
   * @param e - Drop event
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  /**
   * Handles file selection from the native file input
   * @param e - Change event from file input
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  /**
   * Removes the selected image and shows the drag & drop area again
   * This works exactly like in category-new.tsx
   */
  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData(prev => ({
      ...prev,
      image: ""
    }));
    setHasImageChanged(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Validates the entire form before submission
   * @returns True if form is valid, false otherwise
   */
  const validateForm = () => {
    const nameError = validateField("name", formData.name);
    const descriptionError = validateField("description", formData.description);

    const isNameEmpty = !formData.name.trim();
    if (isNameEmpty) {
      setFormErrors(prev => ({...prev, name: "Category name is required."}))
    }

    const isImageEmpty = !formData.image.trim();
    if (isImageEmpty) {
      setFormErrors(prev => ({...prev, image: "Category image is required."}));
    }

    return !nameError && !descriptionError && !isNameEmpty && !isImageEmpty;
  };

  /**
   * Handles the form submission process, including final validation and API call
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // If image has changed and we have a new image, delete the old one from Cloudinary
      if (hasImageChanged && originalImage && formData.image !== originalImage) {
        try {
          await deleteImageFromCloudinary(originalImage);
          console.log('Old image deleted from Cloudinary');
        } catch (deleteError) {
          console.warn('Failed to delete old image from Cloudinary:', deleteError);
          // Don't fail the update if image deletion fails
        }
      }

      // Update the category
      const updatedCategory = await categoryService.updateCategory(id!, {
        name: formData.name,
        description: formData.description,
        image: formData.image
      });

      setSuccess("Category updated successfully!");
      setTimeout(() => {
        navigate("/admin/categories");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the category");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching initial data
  if (isInitialLoading) {
    return (
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Category</h1>
          <p className="text-gray-600">Update category information</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/admin/categories")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Categories</span>
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Category</h1>
        <p className="text-gray-600">Update category information and image</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <X size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <Save size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
              }`}
              placeholder="e.g., Graphics Cards, Processors, Motherboards"
            />
            {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
            <p className="text-sm text-gray-500 mt-1">
              This will be used as the display name for the category
            </p>
          </div>

          {/* Category Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none ${
                formErrors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
              }`}
              placeholder="Describe what this category contains..."
            />
            {formErrors.description && <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>}
            <p className="text-sm text-gray-500 mt-1">
              Optional description to help users understand what belongs in this category
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image *
            </label>
            
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-purple-500 bg-purple-50' 
                  : formErrors.image ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedFile?.name || "Current image"}
                  </p>
                  {isUploading && (
                    <div className="flex items-center justify-center gap-2 text-purple-600">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </div>
                  )}
                  {hasImageChanged && (
                    <p className="text-xs text-purple-600">
                      New image selected - old image will be deleted from storage
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop an image here, or{" "}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
             {formErrors.image && <p className="text-sm text-red-600 mt-1">{formErrors.image}</p>}
          </div>

          {/* Preview */}
          {formData.name && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
              <div className="flex items-center gap-3">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt={formData.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{formData.name}</h4>
                  {formData.description && (
                    <p className="text-sm text-gray-600">{formData.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploading || formErrors.name !== "" || formErrors.description !== "" || !formData.name.trim() || !formData.image.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Update Category</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CategoryEdit; 