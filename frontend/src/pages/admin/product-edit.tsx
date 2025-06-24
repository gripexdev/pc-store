import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from "lucide-react";
import { uploadImageToCloudinary, validateImageFile } from "../../services/cloudinaryService";
import { productService, Product } from "../../services/productService";
import AsyncSelect from 'react-select/async';
import { GroupBase, StylesConfig } from 'react-select';

// Main component for editing an existing product
const ProductEdit = () => {
  // Initialize navigation and get product ID from URL params
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Refs and state management
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    brand: ""
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    brand: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  
  // Track if image has been changed to determine if we need to delete old image
  const [imageChanged, setImageChanged] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>("");
  
  // Track the selected category option for AsyncSelect
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);

  // Type for react-select option
  type CategoryOption = { value: string; label: string };

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch the product data when component mounts and categories are loaded
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Product ID is required");
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        setError("");
        
        // Fetch the product data
        const product = await productService.getProductById(id);
        
        // Set form data with existing product values (matching product-new.tsx fields)
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          category: typeof product.category === 'object' ? product.category._id : product.category || "",
          image: product.images && product.images.length > 0 ? product.images[0] : "",
          brand: product.brand || ""
        });
        
        // Set the selected category for AsyncSelect
        const categoryId = typeof product.category === 'object' ? product.category._id : product.category;
        if (categoryId) {
          const categoryName = typeof product.category === 'object' ? product.category.name : categories.find(c => c._id === categoryId)?.name;
          if (categoryName) {
            setSelectedCategory({ value: categoryId, label: categoryName });
          }
        }
        
        // Set the original image for comparison
        if (product.images && product.images.length > 0) {
          setOriginalImage(product.images[0]);
          setPreviewUrl(product.images[0]);
        }
        
      } catch (err: any) {
        setError(err.message || "Failed to fetch product");
      } finally {
        setIsFetching(false);
      }
    };

    // Only fetch product data after categories are loaded
    if (categories.length > 0 || isFetching) {
      fetchProduct();
    }
  }, [id, categories.length]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== originalImage) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, originalImage]);

  // Validate a single field (matching product-new.tsx validation)
  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "name":
        if (value.trim().length > 0 && value.trim().length < 3) {
          error = "Product name must be at least 3 characters long.";
        } else if (value.trim().length > 100) {
          error = "Product name must be less than 100 characters long.";
        }
        break;
      case "price":
        if (!value.trim()) {
          error = "Price is required.";
        } else if (isNaN(Number(value)) || Number(value) <= 0) {
          error = "Price must be a positive number.";
        }
        break;
      case "description":
        if (value.length > 1000) {
          error = "Description must be less than 1000 characters long.";
        }
        break;
      case "category":
        if (!value.trim()) {
          error = "Category is required.";
        }
        break;
      case "brand":
        if (!value.trim()) {
          error = "Brand is required.";
        }
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  // Handle file selection and upload
  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type and size before upload
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setSelectedFile(file);
    setError("");
    setFormErrors(prev => ({...prev, image: ""}));
    
    // Create preview URL for the new file
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Mark that image has changed
    setImageChanged(true);
    
    setIsUploading(true);
    try {
      // Upload to Cloudinary in the 'products' folder with the products upload preset
      const result = await uploadImageToCloudinary(file, 'pc-store/products', 'pc-store-products-upload');
      setFormData(prev => ({
        ...prev,
        image: result.secure_url
      }));
    } catch (err: any) {
      setError(`Image preview saved, but upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Remove selected image
  const removeImage = () => {
    if (previewUrl && previewUrl !== originalImage) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData(prev => ({
      ...prev,
      image: ""
    }));
    setImageChanged(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate the entire form (matching product-new.tsx validation)
  const validateForm = () => {
    const nameError = validateField("name", formData.name);
    const priceError = validateField("price", formData.price);
    const descriptionError = validateField("description", formData.description);
    const categoryError = validateField("category", formData.category);
    const brandError = validateField("brand", formData.brand);
    
    const isNameEmpty = !formData.name.trim();
    if (isNameEmpty) {
      setFormErrors(prev => ({...prev, name: "Product name is required."}))
    }
    const isPriceEmpty = !formData.price.trim();
    if (isPriceEmpty) {
      setFormErrors(prev => ({...prev, price: "Price is required."}))
    }
    const isCategoryEmpty = !formData.category.trim();
    if (isCategoryEmpty) {
      setFormErrors(prev => ({...prev, category: "Category is required."}))
    }
    const isBrandEmpty = !formData.brand.trim();
    if (isBrandEmpty) {
      setFormErrors(prev => ({...prev, brand: "Brand is required."}))
    }
    const isImageEmpty = !formData.image.trim();
    if (isImageEmpty) {
      setFormErrors(prev => ({...prev, image: "Product image is required."}));
    }
    
    return !nameError && !priceError && !descriptionError && !categoryError && !brandError && !isNameEmpty && !isPriceEmpty && !isCategoryEmpty && !isBrandEmpty && !isImageEmpty;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    if (!id) {
      setError("Product ID is required");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Prepare the update data (matching product-new.tsx structure)
      const updateData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        images: formData.image ? [formData.image] : [], // Backend expects an array
        brand: formData.brand
      };

      // Update the product using the product service
      await productService.updateProduct(id, updateData);
      
      setSuccess("Product updated successfully!");
      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the product");
    } finally {
      setIsLoading(false);
    }
  };

  // Async load options for category select
  const loadCategoryOptions = async (inputValue: string): Promise<CategoryOption[]> => {
    try {
      const res = await fetch(`http://localhost:5000/api/categories?search=${encodeURIComponent(inputValue)}&limit=20`);
      const data = await res.json();
      return (data.categories || []).map((cat: any) => ({
        value: cat._id,
        label: cat.name
      }));
    } catch (err) {
      return [];
    }
  };

  // Show loading state while fetching product
  if (isFetching) {
    return (
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
          <p className="text-gray-600">Loading product data...</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Products</span>
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
        <p className="text-gray-600">Update product information and images</p>
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
          
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
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
              placeholder="e.g., NVIDIA RTX 4090, Intel i9-13900K"
            />
            {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
            <p className="text-sm text-gray-500 mt-1">
              This will be used as the display name for the product
            </p>
          </div>
          
          {/* Product Brand */}
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                formErrors.brand ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
              }`}
              placeholder="e.g., NVIDIA, Intel, AMD"
            />
            {formErrors.brand && <p className="text-sm text-red-600 mt-1">{formErrors.brand}</p>}
            <p className="text-sm text-gray-500 mt-1">
              Enter the brand or manufacturer of the product
            </p>
          </div>
          
          {/* Product Description */}
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
              placeholder="Describe the product features, specs, etc."
            />
            {formErrors.description && <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>}
            <p className="text-sm text-gray-500 mt-1">
              Optional description to help users understand the product
            </p>
          </div>
          
          {/* Product Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price (USD) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0.01"
              step="0.01"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                formErrors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
              }`}
              placeholder="e.g., 499.99"
            />
            {formErrors.price && <p className="text-sm text-red-600 mt-1">{formErrors.price}</p>}
          </div>
          
          {/* Product Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <AsyncSelect<CategoryOption, false, GroupBase<CategoryOption>>
              cacheOptions
              defaultOptions
              loadOptions={loadCategoryOptions}
              value={selectedCategory}
              onChange={(option: CategoryOption | null) => {
                setSelectedCategory(option);
                setFormData(prev => ({ ...prev, category: option ? option.value : '' }));
              }}
              isClearable
              placeholder="Search or select a category..."
              styles={{
                control: (base: React.CSSProperties, state: any) => ({
                  ...base,
                  minHeight: '48px',
                  borderColor: formErrors.category ? '#ef4444' : '#d1d5db',
                  boxShadow: state.isFocused ? (formErrors.category ? '0 0 0 2px #ef4444' : '0 0 0 2px #a78bfa') : undefined,
                  '&:hover': {
                    borderColor: formErrors.category ? '#ef4444' : '#a78bfa',
                  },
                }),
              } as StylesConfig<CategoryOption, false>}
            />
            {formErrors.category && <p className="text-sm text-red-600 mt-1">{formErrors.category}</p>}
          </div>
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image *
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
                    {selectedFile?.name || (imageChanged ? "New image uploaded" : "Current product image")}
                  </p>
                  {isUploading && (
                    <div className="flex items-center justify-center gap-2 text-purple-600">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </div>
                  )}
                  {imageChanged && (
                    <p className="text-xs text-blue-600">
                      ⚠️ Old image will be deleted from Cloudinary when you save
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
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploading || formErrors.name !== "" || formErrors.price !== "" || formErrors.category !== "" || !formData.name.trim() || !formData.price.trim() || !formData.category.trim() || !formData.image.trim() || !formData.brand.trim()}
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
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductEdit; 