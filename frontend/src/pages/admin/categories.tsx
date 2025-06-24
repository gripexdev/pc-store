import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { FolderOpen, Plus, Edit, Trash2, Image as ImageIcon, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { categoryService, Category, PaginationInfo } from "../../services/categoryService";

const AdminCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    categoryId: string | null;
    categoryName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: "",
    isDeleting: false,
  });

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  useEffect(() => {
    // Debounce search to avoid too many API calls
    // Wait 500ms after user stops typing before making API request
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchCategories();
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch categories with current page, limit of 10, and search term
      const data = await categoryService.getAllCategories(currentPage, 10, searchTerm);
      setCategories(data.categories);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setDeleteDialog({
      isOpen: true,
      categoryId: id,
      categoryName: name,
      isDeleting: false,
    });
  };

  const confirmDeleteCategory = async () => {
    if (!deleteDialog.categoryId) return;
    try {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
      await categoryService.deleteCategory(deleteDialog.categoryId);
      setDeleteDialog({
        isOpen: false,
        categoryId: null,
        categoryName: "",
        isDeleting: false,
      });
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDeleteCategory = () => {
    setDeleteDialog({
      isOpen: false,
      categoryId: null,
      categoryName: "",
      isDeleting: false,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && categories.length === 0) {
    return (
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories Management</h1>
          <p className="text-gray-600">Organize your products into categories</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories Management</h1>
        <p className="text-gray-600">Organize your products into categories</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Product Categories</h2>
          <button 
            onClick={() => navigate("/admin/category/new")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search categories by name, description, or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={32} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No categories found' : 'No Categories Yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `No categories match "${searchTerm}"` 
                : 'Get started by creating your first product category'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={() => navigate("/admin/category/new")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create First Category
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {categories.map((category) => (
                <div key={category._id} className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">/{category.slug}</p>
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 overflow-hidden">
                          {category.description}
                        </p>
                      )}
                    </div>
                    {category.image ? (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center ml-3">
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center ml-3">
                        <ImageIcon size={20} className="text-purple-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Created: {formatDate(category.createdAt)}</span>
                    <span>Updated: {formatDate(category.updatedAt)}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/admin/category/edit/${category._id}`)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id, category.name)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalCategories)} of{' '}
                  {pagination.totalCategories} categories
                </div>
                
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
                        // If total pages ≤ 5, show all pages
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        // If on first 3 pages, show pages 1-5
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        // If on last 3 pages, show last 5 pages
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        // If in middle, show 2 pages before and after current
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            pageNum === pagination.currentPage
                              ? 'bg-purple-600 text-white'
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

      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{deleteDialog.categoryName}"</span>?
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={cancelDeleteCategory}
                disabled={deleteDialog.isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
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

export default AdminCategories; 