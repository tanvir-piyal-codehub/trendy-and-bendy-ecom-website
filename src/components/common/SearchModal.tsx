import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToCategory: (categorySlug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onNavigateToCategory
}) => {
  const { products, categories, formatCurrency } = useStore();
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [products, query]);

  if (!isOpen) return null;

  const popularSearches = ['Retro MP3', 'Mini Flip Phone', 'Kitten Heels', 'Lipstick Keychain', 'Facial Trimmer'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#FAF9F6] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search aesthetic gadgets, heels, accessories, keychains..."
            autoFocus
            className="flex-1 text-sm text-[#1E1E1E] placeholder-gray-400 bg-transparent focus:outline-none font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-black rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs font-semibold text-gray-500 hover:text-black"
            >
              ESC
            </button>
          )}
        </div>

        {/* Search Results / Suggestions */}
        <div className="overflow-y-auto p-5 space-y-6">
          {query.trim() === '' ? (
            <>
              {/* Popular Searches */}
              <div>
                <h4 className="text-xs uppercase font-semibold text-gray-600 tracking-wider mb-2.5">
                  Popular Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:border-black rounded-lg text-xs text-gray-700 transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-[#F472B6]" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs uppercase font-semibold text-gray-600 tracking-wider mb-2.5">
                  Browse by Category
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onClose();
                        onNavigateToCategory(cat.slug);
                      }}
                      className="p-3 bg-white border border-gray-200 hover:border-black rounded-xl text-left transition-colors group"
                    >
                      <span className="text-xs font-semibold text-gray-900 group-hover:text-[#BE185D] block">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {cat.itemCount || 0} products
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-gray-500">
                Found <span className="font-semibold text-gray-900">{filteredProducts.length}</span> matching products
              </div>
              <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-200 overflow-hidden">
                {filteredProducts.map((p) => {
                  const isPre = p.status === 'PRE_ORDER' || p.preorderSettings?.isPreorder;
                  const price = p.salePrice ?? p.regularPrice;
                  const img = p.images[0]?.url;

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onClose();
                        onSelectProduct(p);
                      }}
                      className="p-3 flex items-center gap-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {img && (
                          <img
                            src={img}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>{p.category}</span>
                          <span>·</span>
                          {isPre ? (
                            <span className="text-[#BE185D] font-medium">Pre-Order (60% advance)</span>
                          ) : (
                            <span className="text-emerald-700 font-medium">In Stock</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-900 tabular-nums">
                          {formatCurrency(price)}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 ml-auto mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm font-semibold text-gray-900">No products found for "{query}"</p>
              <p className="text-xs text-gray-500 mt-1">
                Try searching for retro MP3, flip phone, heels, keychain, or trimmer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
