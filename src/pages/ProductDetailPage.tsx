import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Clock, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Share2, 
  Instagram, 
  Check, 
  Sparkles, 
  ChevronRight,
  Info
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../types';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { db } from '../services/db';
import { ProductCard } from '../components/common/ProductCard';

interface ProductDetailPageProps {
  product: Product;
  onNavigate: (page: string, param?: string) => void;
  onSelectProduct: (product: Product) => void;
  onBuyNow: (product: Product, variant?: ProductVariant, quantity?: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onNavigate,
  onSelectProduct,
  onBuyNow
}) => {
  const { formatCurrency, isInWishlist, toggleWishlist, products } = useStore();
  const { addItem } = useCart();

  // Selected variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'reviews'>('details');
  const [copySuccess, setCopySuccess] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Reviews for this product
  const [reviews, setReviews] = useState<Review[]>(() => db.getProductReviews(product.id));

  useEffect(() => {
    setReviews(db.getProductReviews(product.id));
    setSelectedImageIndex(0);
    setQuantity(1);
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const isPreorder = product.status === 'PRE_ORDER' || product.preorderSettings?.isPreorder;
  const isWishlisted = isInWishlist(product.id);

  // Financial calculations
  const basePrice = (product.salePrice ?? product.regularPrice) + (selectedVariant?.priceAdjustment ?? 0);
  const regularPrice = product.regularPrice + (selectedVariant?.priceAdjustment ?? 0);
  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;

  const advancePercentage = product.preorderSettings?.advancePercentage ?? 60;
  const advancePerUnit = Math.round((basePrice * advancePercentage) / 100);
  const remainingPerUnit = basePrice - advancePerUnit;

  const totalAdvancePayable = advancePerUnit * quantity;
  const totalRemainingPayable = remainingPerUnit * quantity;
  const totalItemPrice = basePrice * quantity;

  // Countdown calculations
  const [timeLeft, setTimeLeft] = useState({ days: 20, hours: 14, minutes: 30, seconds: 45 });
  useEffect(() => {
    if (!isPreorder || !product.preorderSettings?.closingDate) return;
    const target = new Date(product.preorderSettings.closingDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPreorder, product.preorderSettings?.closingDate]);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewComment) return;
    const newRev = db.addReview({
      productId: product.id,
      productName: product.name,
      customerName: reviewerName,
      customerEmail: reviewerEmail || 'customer@gmail.com',
      rating,
      comment: reviewComment,
      isVerifiedPurchase: true,
      status: 'APPROVED',
      isFeatured: false
    });
    setReviews([newRev, ...reviews]);
    setReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewModal(false);
      setReviewSubmitted(false);
      setReviewComment('');
    }, 1500);
  };

  // Related products in same category
  const relatedProducts = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const images = product.images.length > 0 ? product.images : [{ url: '', alt: product.name }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 sm:space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <button onClick={() => onNavigate('home')} className="hover:text-black">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <button onClick={() => onNavigate('shop')} className="hover:text-black">
          Shop
        </button>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <button
          onClick={() => onNavigate('category', product.category.toLowerCase())}
          className="hover:text-black"
        >
          {product.category}
        </button>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Contiguous Purchase Module (Sticky Gallery Left, Sticky Purchase Module Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Gallery Column (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visual Image Box */}
          <div className="relative aspect-4/3 w-full bg-[#F4F4F5] rounded-2xl overflow-hidden border border-gray-200">
            {images[selectedImageIndex]?.url ? (
              <img
                src={images[selectedImageIndex].url}
                alt={images[selectedImageIndex].alt || product.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gray-50">
                <Sparkles className="w-12 h-12 text-[#F472B6] mb-3" />
                <span className="text-sm font-semibold text-gray-700">{product.name}</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isPreorder ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E1E1E]/90 text-white text-xs font-semibold backdrop-blur-xs tracking-wide">
                  <Clock className="w-3.5 h-3.5 text-[#F472B6]" />
                  PRE-ORDER OPEN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-emerald-800 text-xs font-bold shadow-xs">
                  IN STOCK (24H DISPATCH)
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-xs transition-colors ${
                isWishlisted
                  ? 'bg-white text-[#E11D48] shadow-md'
                  : 'bg-white/80 text-gray-600 hover:text-black hover:bg-white'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#E11D48]' : ''}`} />
            </button>
          </div>

          {/* Thumbnails row if multiple images exist */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-black ring-2 ring-black/10' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Module Column (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs">
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span className="uppercase tracking-wider font-semibold text-[#831843]">{product.brand}</span>
              <span className="text-gray-400">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1E1E] leading-snug">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-500 text-sm">
                {'★'.repeat(Math.round(product.rating))}
                {'☆'.repeat(5 - Math.round(product.rating))}
              </div>
              <span className="text-xs font-semibold text-gray-800">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="py-3 border-y border-gray-100 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold font-mono text-[#1E1E1E] tabular-nums">
                  {formatCurrency(basePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through font-mono tabular-nums">
                    {formatCurrency(regularPrice)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">All local customs & import fees included</p>
            </div>

            {hasDiscount && (
              <span className="px-2.5 py-1 rounded bg-[#E11D48] text-white text-xs font-bold">
                SAVE {Math.round(((regularPrice - basePrice) / regularPrice) * 100)}%
              </span>
            )}
          </div>

          {/* PRE-ORDER DYNAMIC CALCULATION BOX */}
          {isPreorder ? (
            <div className="p-4 bg-[#FDF2F8] border border-[#FBCFE8] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#831843] uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#E11D48]" />
                  Pre-Order Payment Breakdown
                </span>
                <span className="text-[11px] font-semibold text-[#BE185D]">
                  {advancePercentage}% Advance Deposit
                </span>
              </div>

              {/* Advance Amount Calculation */}
              <div className="bg-white p-3 rounded-lg border border-[#FBCFE8] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-900">Pay Now (Advance):</span>
                  <span className="text-base font-bold font-mono text-[#BE185D] tabular-nums">
                    {formatCurrency(totalAdvancePayable)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>Balance Due on Arrival:</span>
                  <span className="font-medium font-mono text-gray-800 tabular-nums">
                    {formatCurrency(totalRemainingPayable)} (40%)
                  </span>
                </div>
              </div>

              {/* Delivery Timeline info */}
              <div className="text-xs text-[#831843] space-y-1">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>
                    Estimated Delivery: <strong>35–45 days</strong> after batch closes
                  </span>
                </div>
                <div className="text-[11px] text-gray-600 pl-5">
                  Batch closes: <strong>{new Date(product.preorderSettings?.closingDate || '2026-10-25').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
              </div>

              {/* Live Countdown in Box */}
              <div className="pt-2 border-t border-[#FBCFE8] flex items-center justify-between text-xs text-[#831843]">
                <span className="font-medium">Batch closes in:</span>
                <span className="font-mono font-bold text-[#E11D48] tabular-nums">
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>In stock at Dhaka warehouse. Ships within 24 hours nationwide.</span>
            </div>
          )}

          {/* Variant Selectors (Color / Size) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-900">
                Choose Variant:{' '}
                <span className="text-[#BE185D] font-semibold">{selectedVariant?.name}</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-black bg-[#1E1E1E] text-white shadow-xs'
                          : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
                      }`}
                    >
                      {v.color && (
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: v.color }}
                        />
                      )}
                      <span>{v.name}</span>
                      {v.priceAdjustment !== 0 && (
                        <span className="text-[10px] opacity-80">
                          (+{formatCurrency(v.priceAdjustment)})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-900">
              Quantity:
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-black font-bold"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold tabular-nums text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:text-black font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Subtotal preview for multiple quantity */}
              {quantity > 1 && (
                <span className="text-xs text-gray-500 tabular-nums">
                  Total: <strong className="text-gray-900">{formatCurrency(totalItemPrice)}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 px-4 bg-[#1E1E1E] hover:bg-black text-white rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isPreorder ? `Pre-Order Now (Pay ৳${totalAdvancePayable.toLocaleString()} Advance)` : 'Add to Shopping Bag'}</span>
            </button>

            <button
              onClick={() => onBuyNow(product, selectedVariant, quantity)}
              className="w-full py-3.5 px-4 bg-[#BE185D] hover:bg-[#9D174D] text-white rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-2 shadow-md shadow-pink-900/20 transition-all"
            >
              <span>Instant Checkout</span>
            </button>
          </div>

          {/* Added feedback */}
          {addedToast && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Added to shopping bag! Opening drawer...</span>
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>100% Quality Checked</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-700" />
              <span>48h Return Guarantee</span>
            </div>
          </div>

          {/* Social Share & Instagram Link */}
          <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 hover:text-black transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copySuccess ? 'Link Copied!' : 'Share Product'}</span>
            </button>

            {product.instagramPostUrl && (
              <a
                href={product.instagramPostUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#BE185D] hover:underline"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>View Instagram Drop</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Description, Shipping & Returns, Customer Reviews */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 bg-[#FAF9F6] px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-4 text-xs font-bold tracking-wide uppercase transition-colors relative ${
              activeTab === 'details' ? 'text-[#1E1E1E]' : 'text-gray-500 hover:text-black'
            }`}
          >
            Product Overview
            {activeTab === 'details' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E1E]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`py-4 px-4 text-xs font-bold tracking-wide uppercase transition-colors relative ${
              activeTab === 'shipping' ? 'text-[#1E1E1E]' : 'text-gray-500 hover:text-black'
            }`}
          >
            Shipping & Pre-Order Rules
            {activeTab === 'shipping' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E1E]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 px-4 text-xs font-bold tracking-wide uppercase transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'text-[#1E1E1E]' : 'text-gray-500 hover:text-black'
            }`}
          >
            <span>Reviews ({reviews.length})</span>
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E1E]" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {activeTab === 'details' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-serif font-bold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2">
                  Keywords & Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-gray-700">
              <h3 className="text-base font-serif font-bold text-gray-900">
                Delivery Guidelines
              </h3>
              <p>
                <strong>Inside Dhaka:</strong> Delivery takes 2–3 business days at a flat rate of ৳70.
              </p>
              <p>
                <strong>Outside Dhaka:</strong> Nationwide home delivery takes 3–5 business days at ৳130.
              </p>
              {isPreorder && (
                <div className="p-4 bg-[#FDF2F8] border border-[#FBCFE8] rounded-xl space-y-2 mt-4">
                  <h4 className="font-bold text-[#831843]">Pre-Order Fulfillment Policy</h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#831843]">
                    <li>This product is custom reserved from international manufacturers once the current batch closes.</li>
                    <li>Advance payments are non-refundable once the batch closes unless there is a supplier shortage.</li>
                    <li>You will be sent SMS and tracking dashboard updates when the shipment lands at our Banani sorting center.</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-serif font-bold text-gray-900">
                    Customer Feedback
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-amber-500">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      Based on {reviews.length} verified reviews
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-[#1E1E1E] text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors self-start sm:self-auto"
                >
                  Write a Review
                </button>
              </div>

              {/* Review list */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-gray-50 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{rev.customerName}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex text-amber-500 text-xs">
                        {'★'.repeat(rev.rating)}
                        {'☆'.repeat(5 - rev.rating)}
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-gray-500">
                  No reviews yet for this product. Be the first to share your thoughts!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1E1E1E]">
              You May Also Adore
            </h2>
            <button
              onClick={() => onNavigate('shop')}
              className="text-xs font-semibold text-[#BE185D] hover:underline"
            >
              Explore Collection
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowReviewModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-gray-900">
              Review {product.name}
            </h3>

            {reviewSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium text-center">
                ✨ Thank you! Your review has been submitted and verified.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-xl transition-colors ${
                          star <= rating ? 'text-amber-500' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Samira Rahman"
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    placeholder="e.g. samira@gmail.com"
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Written Review</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="How is the quality, packaging, and aesthetic finish?"
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1E1E1E] text-white text-xs font-semibold rounded-lg hover:bg-black"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
