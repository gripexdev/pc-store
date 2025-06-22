const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCategories: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface CategoriesResponse {
  categories: Category[];
  pagination: PaginationInfo;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  image?: string;
}

class CategoryService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/categories${endpoint}`;
    
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
      console.error('Category service error:', error);
      throw error;
    }
  }

  async getAllCategories(page: number = 1, limit: number = 10, search: string = ""): Promise<CategoriesResponse> {
    // Build query parameters for pagination and search
    const params = new URLSearchParams();
    if (page > 1) params.append('page', page.toString());
    if (limit !== 10) params.append('limit', limit.toString());
    if (search.trim()) params.append('search', search.trim());
    
    // Create query string (e.g., "?page=2&limit=10&search=laptop")
    const queryString = params.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    return this.request<CategoriesResponse>(endpoint);
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.request<Category>(`/${id}`);
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    return this.request<Category>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    return this.request<Category>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const categoryService = new CategoryService(); 