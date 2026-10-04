import React from 'react';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';

interface WishlistPageProps {
  onNavigateToShop: () => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  onNavigateToShop,
  onSelectProduct
}) => {
  const { wishlist, products } = useStore();
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1E1E1E]">My Wishlist</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Your handpicked drops and saved aesthetic items ({wishlistProducts.length} items).
        </p>
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FCE7F3] flex items-center justify-center mx-auto text-[#BE185D]">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-serif font-bold text-gray-900">Your wishlist is empty</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Browse our trending gadgets, aesthetic charms, and fashion pre-orders to save your favorite picks.
          </p>
          <button
            onClick={onNavigateToShop}
            className="px-6 py-3 bg-[#1E1E1E] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors"
          >
            Explore Catalog
          </button>
        </div>
      )}
    </div>
  );
};
