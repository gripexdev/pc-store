import AdminLayout from "../../components/AdminLayout";
import { Monitor, Plus, Search, ChevronLeft, ChevronRight, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { productService, Product, PaginationInfo } from "../../services/productService";

const AdminProducts = () => {
  // React Router navigation for page transitions
  const navigate = useNavigate();

  // State for the list of products
  const [products, setProducts] = useState<Product[]>([]);
  // State for pagination info (current page, total pages, etc.)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  // Loading state for API requests
  const [loading, setLoading] = useState(true);
  // Error state for API errors
  const [error, setError] = useState<string | null>(null);
  // Search term for filtering products
  const [searchTerm, setSearchTerm] = useState("");
  // Current page number for pagination
  const [currentPage, setCurrentPage] = useState(1);
  // Timeout for debouncing search input
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    productId: null,
    productName: "",
    isDeleting: false,
  });

  // Fetch products whenever the current page changes
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [currentPage]);

  // Debounced search: wait 500ms after user stops typing before fetching
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchProducts(1, searchTerm);
    }, 500);
    setSearchTimeout(timeout);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line
  }, [searchTerm]);

  // Fetch products from the API with pagination and search
  const fetchProducts = async (page = currentPage, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      // Call productService to get paginated, filtered products
      const data = await productService.getAllProducts(page, 10, search);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Change the current page (for pagination controls)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format a date string for display (e.g., Jan 1, 2024)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle product deletion with confirmation
  const handleDeleteProduct = (productId: string, productName: string) => {
    setDeleteDialog({
      isOpen: true,
      productId,
      productName,
      isDeleting: false,
    });
  };

  // Confirm and execute product deletion
  const confirmDeleteProduct = async () => {
    if (!deleteDialog.productId) return;

    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
      
      // Call the product service to delete the product
      await productService.deleteProduct(deleteDialog.productId);
      
      // Close the dialog
      setDeleteDialog({
        isOpen: false,
        productId: null,
        productName: "",
        isDeleting: false,
      });
      
      // Refresh the products list
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Cancel delete operation
  const cancelDeleteProduct = () => {
    setDeleteDialog({
      isOpen: false,
      productId: null,
      productName: "",
      isDeleting: false,
    });
  };

  // Show a loading spinner while fetching products
  if (loading && products.length === 0) {
    return (
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Management</h1>
          <p className="text-gray-600">Manage your PC components and products inventory</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Management</h1>
        <p className="text-gray-600">Manage your PC components and products inventory</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header and Add Product button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-900">All Products</h2>
          <button 
            onClick={() => navigate("/admin/products/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>

        {/* Search Bar for filtering products by name, brand, or description */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name, brand, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error message if fetching products fails */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Show message if there are no products (with or without search) */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor size={32} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No products found' : 'No Products Yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `No products match "${searchTerm}"` 
                : 'Get started by adding your first product'}
            </p>
            {/* Show add button only if not searching */}
            {!searchTerm && (
              <button 
                onClick={() => navigate("/admin/products/new")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Products Table - visible on sm+ screens, horizontally scrollable */}
            <div className="w-full overflow-x-auto mb-6 sm:block hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">
                        {/* Show product image or fallback icon */}
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded">
                            <Monitor size={20} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-2 text-gray-700">{product.brand}</td>
                      <td className="px-4 py-2 text-gray-700">{typeof product.category === 'object' && product.category ? product.category.name : ''}</td>
                      <td className="px-4 py-2 text-gray-700">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-gray-700">{product.stock}</td>
                      <td className="px-4 py-2 text-gray-700">{formatDate(product.createdAt)}</td>
                      <td className="px-4 py-2">
                        {/* Action buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="Edit product"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Responsive grid for mobile (show cards instead of table) */}
            <div className="grid grid-cols-1 gap-4 sm:hidden mb-6">
              {products.map((product) => (
                <div key={product._id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center space-x-4 mb-3">
                    {/* Product image or fallback icon */}
                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-gray-200 rounded">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <Monitor size={24} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{product.name}</div>
                      <div className="text-sm text-gray-700 truncate">{product.brand}</div>
                      <div className="text-xs text-gray-500 truncate">{typeof product.category === 'object' && product.category ? product.category.name : ''}</div>
                      <div className="text-xs text-gray-500">${product.price.toFixed(2)} | Stock: {product.stock}</div>
                      <div className="text-xs text-gray-400">{formatDate(product.createdAt)}</div>
                    </div>
                  </div>
                  {/* Action buttons for mobile */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                      className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-sm transition-colors"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id, product.name)}
                      className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-sm transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls - matches categories page style */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                {/* Show range of products currently displayed */}
                <div className="text-sm text-gray-700">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalProducts)} of{' '}
                  {pagination.totalProducts} products
                </div>
                {/* Pagination buttons with smart page numbers */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    {/* Smart pagination: Show up to 5 page numbers intelligently */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            pageNum === pagination.currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{deleteDialog.productName}"</span>? 
              This will also delete all associated images from Cloudinary.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={cancelDeleteProduct}
                disabled={deleteDialog.isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                disabled={deleteDialog.isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {deleteDialog.isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts; 