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
}

export const productService = new ProductService(); 