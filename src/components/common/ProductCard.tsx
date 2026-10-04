import React, { useState } from 'react';
import { Heart, Sparkles, Clock, Check } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { formatCurrency, isInWishlist, toggleWishlist } = useStore();
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isPreorder = product.status === 'PRE_ORDER' || product.preorderSettings?.isPreorder;
  const isWishlisted = isInWishlist(product.id);
  const effectivePrice = product.salePrice ?? product.regularPrice;
  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;

  // Advance payment calculation for card display
  const advancePercentage = product.preorderSettings?.advancePercentage ?? 60;
  const advanceAmount = Math.round((effectivePrice * advancePercentage) / 100);

  const mainImage = product.images.find(img => img.isMain) || product.images[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, product.variants[0]);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:border-[#D1D5DB] hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Visual Asset Container */}
      <div className="relative aspect-4/3 w-full bg-[#F4F4F5] overflow-hidden">
        {!imageError && mainImage ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-[#FAF9F6] to-[#FCE7F3] p-4 text-center">
            <Sparkles className="w-8 h-8 text-[#F472B6] mb-2 stroke-1" />
            <span className="text-xs font-medium text-gray-700">{product.name}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {isPreorder ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E1E1E]/90 backdrop-blur-xs text-white text-[11px] font-medium tracking-wide">
              <Clock className="w-3 h-3 text-[#F472B6]" />
              PRE-ORDER
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/95 backdrop-blur-xs text-[#1E1E1E] text-[11px] font-medium shadow-xs">
              IN STOCK
            </span>
          )}

          {hasDiscount && (
            <span className="px-2 py-0.5 rounded bg-[#E11D48] text-white text-[10px] font-semibold tracking-tight">
              SAVE {Math.round(((product.regularPrice - product.salePrice!) / product.regularPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-xs transition-colors ${
            isWishlisted
              ? 'bg-white text-[#E11D48] shadow-xs'
              : 'bg-white/80 text-gray-600 hover:text-black hover:bg-white'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#E11D48]' : ''}`} />
        </button>

        {/* Quick Add Overlay on hover */}
        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
          <button
            onClick={handleQuickAdd}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold backdrop-blur-md shadow-sm transition-all flex items-center justify-center gap-1.5 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-white/95 text-[#1E1E1E] hover:bg-[#1E1E1E] hover:text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added to Bag
              </>
            ) : isPreorder ? (
              'Quick Pre-Order'
            ) : (
              'Quick Add'
            )}
          </button>
        </div>
      </div>

      {/* Card Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category kicker */}
          <div className="text-[11px] uppercase tracking-wider text-gray-600 font-medium mb-1">
            {product.category}
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-[#1E1E1E] line-clamp-1 group-hover:text-[#9D174D] transition-colors">
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Pre-order Financial Callout */}
        <div className="pt-2 border-t border-gray-100 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#1E1E1E] tabular-nums">
                {formatCurrency(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-500 line-through tabular-nums">
                  {formatCurrency(product.regularPrice)}
                </span>
              )}
            </div>

            {/* Preorder advance breakdown line */}
            {isPreorder ? (
              <div className="text-[11px] text-[#9D174D] font-medium mt-0.5">
                Pay Now: <span className="font-semibold tabular-nums">{formatCurrency(advanceAmount)}</span> ({advancePercentage}%)
              </div>
            ) : (
              <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                Ready for 24h dispatch
              </div>
            )}
          </div>

          {/* Review star count */}
          {product.rating > 0 && (
            <div className="text-[11px] text-gray-600 flex items-center gap-0.5 tabular-nums">
              <span className="text-amber-500">★</span>
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-gray-500">({product.reviewCount})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
