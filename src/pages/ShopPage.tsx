import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Search, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';

interface ShopPageProps {
  initialCategory?: string;
  initialType?: 'all' | 'preorder' | 'instock';
  onSelectProduct: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory,
  initialType = 'all',
  onSelectProduct
}) => {
  const { products, categories, formatCurrency } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedType, setSelectedType] = useState<'all' | 'preorder' | 'instock'>(initialType);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync if initial prop changes
  React.useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialType) setSelectedType(initialType);
  }, [initialType]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchingCat = categories.find(c => c.slug === selectedCategory);
        if (matchingCat && p.category !== matchingCat.name) return false;
      }

      // Type filter
      const isPre = p.status === 'PRE_ORDER' || p.preorderSettings?.isPreorder;
      if (selectedType === 'preorder' && !isPre) return false;
      if (selectedType === 'instock' && isPre) return false;

      // Price filter
      const price = p.salePrice ?? p.regularPrice;
      if (price > maxPrice) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice ?? a.regularPrice;
      const priceB = b.salePrice ?? b.regularPrice;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, categories, selectedCategory, selectedType, maxPrice, searchQuery, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setMaxPrice(6000);
    setSearchQuery('');
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' || selectedType !== 'all' || maxPrice < 6000 || searchQuery.trim() !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title & Description */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1E1E1E]">
          {selectedType === 'preorder'
            ? 'Pre-Order Collection'
            : selectedCategory !== 'all'
            ? categories.find(c => c.slug === selectedCategory)?.name || 'Collection'
            : 'Shop All Products'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
          Browse our handpicked drops, viral nostalgic electronics, designer footwear, and aesthetic vanity charms.
        </p>
      </div>

      {/* Top Filter Bar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        {/* Type Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedType === 'all'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setSelectedType('preorder')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              selectedType === 'preorder'
                ? 'bg-[#BE185D] text-white shadow-2xs'
                : 'text-gray-600 hover:text-[#BE185D]'
            }`}
          >
            <span>Pre-Orders</span>
            <span className="text-[10px] opacity-80">(60% Adv)</span>
          </button>
          <button
            onClick={() => setSelectedType('instock')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedType === 'instock'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-gray-600 hover:text-emerald-700'
            }`}
          >
            In Stock (Ready)
          </button>
        </div>

        {/* Right tools: Search, Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 font-medium focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Desktop Filter Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          {/* Search in Catalog */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
              Search Catalog
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Keywords or model..."
                className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
              Category
            </label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left py-1.5 px-2 rounded-md transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#FCE7F3] text-[#831843] font-semibold'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left py-1.5 px-2 rounded-md transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? 'bg-[#FCE7F3] text-[#831843] font-semibold'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-gray-400">({cat.itemCount || 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
              <span>Max Price</span>
              <span className="font-mono text-gray-700 font-semibold">{formatCurrency(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="6000"
              step="250"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#1E1E1E] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>৳500</span>
              <span>৳6,000+</span>
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-gray-500">Active filters:</span>
              {selectedType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700">
                  Type: {selectedType === 'preorder' ? 'Pre-Order' : 'In Stock'}
                  <button onClick={() => setSelectedType('all')}>
                    <X className="w-3 h-3 text-gray-400 hover:text-black" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700">
                  Category: {categories.find(c => c.slug === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')}>
                    <X className="w-3 h-3 text-gray-400 hover:text-black" />
                  </button>
                </span>
              )}
              {maxPrice < 6000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700">
                  Under {formatCurrency(maxPrice)}
                  <button onClick={() => setMaxPrice(6000)}>
                    <X className="w-3 h-3 text-gray-400 hover:text-black" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-[#BE185D] hover:underline font-medium ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
              <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900">No products match your criteria</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-6">
                Try widening your price limit or clearing category and search filters to see all available drops.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-[#1E1E1E] text-white rounded-lg text-xs font-semibold hover:bg-black"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-[#FAF9F6] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Filter Products</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">Category</h4>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg ${
                      selectedCategory === 'all' ? 'bg-[#FCE7F3] font-semibold text-[#831843]' : 'text-gray-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCategory(c.slug);
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg ${
                        selectedCategory === c.slug ? 'bg-[#FCE7F3] font-semibold text-[#831843]' : 'text-gray-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                  Max Price: {formatCurrency(maxPrice)}
                </h4>
                <input
                  type="range"
                  min="500"
                  max="6000"
                  step="250"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#1E1E1E]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#1E1E1E] text-white rounded-xl text-xs font-semibold"
              >
                Apply Filters ({filteredProducts.length} items)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
