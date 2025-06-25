import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService, Product, PaginationInfo } from "../services/productService";
import { categoryService, Category } from "../services/categoryService";
import { Search, ChevronLeft, ChevronRight, ArrowLeft, Star, ShoppingCart, Eye } from "lucide-react";

/**
 * CategoryPage Component
 * 
 * Modern, brand-focused page displaying products from a specific category.
 * Features a sleek design with animations, gradients, and engaging elements
 * to maximize client engagement and conversion.
 * 
 * Features:
 * - Hero section with category showcase
 * - Advanced search with filters
 * - Product cards with hover effects and CTAs
 * - Smooth animations and transitions
 * - Modern pagination design
 * - Responsive and accessible design
 * 
 * URL Pattern: /category/:categoryId
 * Example: /category/507f1f77bcf86cd799439011
 */
const CategoryPage = () => {
  // Extract category ID from URL parameters
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  // ===== STATE MANAGEMENT =====
  
  // Products and pagination state
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Category information state
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  
  // Search and pagination controls state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // ===== EFFECTS =====

  /**
   * Fetch category information when component mounts or categoryId changes
   * This effect runs once to get the category details for display
   */
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;
      
      try {
        setCategoryLoading(true);
        const categoryData = await categoryService.getCategoryById(categoryId);
        setCategory(categoryData);
      } catch (err) {
        console.error("Error fetching category:", err);
        // Don't set error state here as we want to show the page even if category fetch fails
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  /**
   * Fetch products when page number changes or categoryId changes
   * This effect handles pagination and initial product loading
   */
  useEffect(() => {
    if (categoryId) {
      fetchProducts();
    }
  }, [currentPage, categoryId]);

  /**
   * Debounced search effect
   * Waits 500ms after user stops typing before making API request
   * This prevents excessive API calls while user is still typing
   */
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      if (categoryId) {
        fetchProducts(1, searchTerm);
      }
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm, categoryId]);

  // ===== HELPER FUNCTIONS =====

  /**
   * Fetches products from the API with current pagination and search parameters
   * @param page - Page number to fetch (defaults to current page)
   * @param search - Search term to filter by (defaults to current search term)
   */
  const fetchProducts = async (page = currentPage, search = searchTerm) => {
    if (!categoryId) return;
    
    try {
      setLoading(true);
      setError(null);
      // Fetch 12 products per page for optimal grid layout
      const data = await productService.getProductsByCategory(categoryId, page, 12, search);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles pagination navigation
   * @param page - The page number to navigate to
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Formats price as currency for display
   * @param price - The price to format
   * @returns Formatted price string (e.g., "$299.99")
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // ===== LOADING STATES =====

  // Show loading spinner while fetching category information
  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading category...</p>
        </div>
      </div>
    );
  }

  // Show error page if category doesn't exist
  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Category Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg">The category you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Explore Our Categories
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Navigation */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:bg-white/50 px-4 py-2 rounded-lg"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </button>
          </div>
          
          {/* Category Hero Content */}
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Category Image */}
            <div className="relative">
              {category.image ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="relative w-32 h-32 lg:w-40 lg:h-40 object-cover rounded-2xl shadow-2xl border-4 border-white/20 backdrop-blur-sm"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Search size={48} className="text-white" />
                </div>
              )}
            </div>
            
            {/* Category Information */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-4">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                Premium Category
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-xl text-gray-600 mb-6 max-w-2xl">
                  {category.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">Products</span>
                  <div className="text-lg font-bold text-gray-900">{pagination?.totalProducts || 0}</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">Pages</span>
                  <div className="text-lg font-bold text-gray-900">{pagination?.totalPages || 1}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Advanced Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products in this category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 border-0 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-300"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="text-sm text-gray-400">
                {products.length} results
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Search size={16} className="text-red-600" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Products Display Section */}
        {loading ? (
          // Loading state with skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm ? 'No products found' : 'No Products Yet'}
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              {searchTerm 
                ? `No products match "${searchTerm}" in this category` 
                : 'This category doesn\'t have any products yet. Check back soon!'
              }
            </p>
          </div>
        ) : (
          // Products grid and pagination
          <>
            {/* Products Grid - Modern Card Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-white/20"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {/* Product Image Container */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Search size={48} className="text-gray-400" />
                      </div>
                    )}
                    
                    {/* Hover Overlay with Actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 transform hover:scale-110">
                          <Eye size={20} className="text-gray-700" />
                        </button>
                        <button className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-110">
                          <ShoppingCart size={20} className="text-white" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Stock Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                        product.stock > 0 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 font-medium">{product.brand}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 font-medium">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modern Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Pagination Info */}
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-semibold text-gray-900">{Math.min(pagination.currentPage * pagination.limit, pagination.totalProducts)}</span> of{' '}
                    <span className="font-semibold text-gray-900">{pagination.totalProducts}</span> products
                  </div>
                  
                  {/* Pagination Navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === pagination.currentPage;
                        const isNearCurrent = Math.abs(pageNumber - pagination.currentPage) <= 1;
                        
                        if (isCurrentPage || isNearCurrent || pageNumber === 1 || pageNumber === pagination.totalPages) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                                isCurrentPage
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (pageNumber === 2 && pagination.currentPage > 3) {
                          return <span key="ellipsis1" className="px-2 text-gray-400">...</span>;
                        } else if (pageNumber === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2) {
                          return <span key="ellipsis2" className="px-2 text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage; 