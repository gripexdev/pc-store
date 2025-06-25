const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface Product {
  _id: string;
  name: string;
  brand: string;
  description: string;
  category: any; // Can be populated object or just id
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
}

class ProductService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/products${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  }

  async getAllProducts(page: number = 1, limit: number = 10, search: string = ""): Promise<ProductsResponse> {
    // Build query parameters for pagination and search
    const params = new URLSearchParams();
    if (page > 1) params.append('page', page.toString());
    if (limit !== 10) params.append('limit', limit.toString());
    if (search.trim()) params.append('search', search.trim());
    const queryString = params.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    return this.request<ProductsResponse>(endpoint);
  }

  /**
   * Fetches products filtered by a specific category with pagination and search support
   * This method calls the backend API endpoint to get products belonging to a category
   * 
   * @param categoryId - The unique identifier of the category to filter by
   * @param page - The page number for pagination (default: 1)
   * @param limit - Number of products to return per page (default: 10)
   * @param search - Optional search term to filter products by name, brand, or description
   * @returns Promise<ProductsResponse> - Object containing products array and pagination metadata
   * 
   * @example
   * // Get first page of products from "Graphics Cards" category
   * const result = await productService.getProductsByCategory("507f1f77bcf86cd799439011", 1, 12);
   * 
   * // Search for "RTX" products in "Graphics Cards" category
   * const result = await productService.getProductsByCategory("507f1f77bcf86cd799439011", 1, 12, "RTX");
   */
  async getProductsByCategory(categoryId: string, page: number = 1, limit: number = 10, search: string = ""): Promise<ProductsResponse> {
    // Build query parameters for pagination and search
    // Only include parameters that differ from defaults to keep URLs clean
    const params = new URLSearchParams();
    if (page > 1) params.append('page', page.toString());
    if (limit !== 10) params.append('limit', limit.toString());
    if (search.trim()) params.append('search', search.trim());
    
    // Construct the endpoint URL with category ID and query parameters
    const queryString = params.toString();
    const endpoint = `/category/${categoryId}${queryString ? `?${queryString}` : ''}`;
    
    // Make the API request and return the response
    return this.request<ProductsResponse>(endpoint);
  }

  /**
   * Deletes a product by ID
   * This will also delete associated images from Cloudinary
   * @param productId - The ID of the product to delete
   * @returns Promise that resolves when deletion is successful
   */
  async deleteProduct(productId: string): Promise<void> {
    return this.request<void>(`/${productId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Updates a product by ID
   * This will also handle image deletion from Cloudinary when a new image is uploaded
   * @param productId - The ID of the product to update
   * @param productData - The updated product data
   * @returns Promise that resolves with the updated product
   */
  async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  /**
   * Gets a single product by ID
   * @param productId - The ID of the product to fetch
   * @returns Promise that resolves with the product data
   */
  async getProductById(productId: string): Promise<Product> {
    return this.request<Product>(`/${productId}`);
  }
}

export const productService = new ProductService(); 