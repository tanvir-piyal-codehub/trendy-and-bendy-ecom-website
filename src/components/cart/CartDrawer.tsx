import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToCheckout, onNavigateToShop }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    appliedCoupon,
    couponDiscount,
    couponMessage,
    applyCouponCode,
    removeCoupon,
    selectedShippingZone,
    setSelectedShippingZone,
    subtotal,
    shippingFee,
    totalOrderAmount,
    hasPreorderItems,
    payNowTotal,
    remainingBalance
  } = useCart();

  const { formatCurrency, settings } = useStore();
  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    applyCouponCode(couponInput);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F6] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1E1E1E]" />
              <h2 className="text-base font-semibold text-[#1E1E1E]">Shopping Bag</h2>
              <span className="text-xs text-gray-500 tabular-nums">({items.length} items)</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FCE7F3] flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-[#BE185D]" />
              </div>
              <h3 className="text-base font-semibold text-[#1E1E1E] mb-1">Your bag is empty</h3>
              <p className="text-xs text-gray-500 max-w-xs mb-6">
                Discover our latest viral drops, nostalgic gadgets, and aesthetic accessories.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigateToShop();
                }}
                className="px-6 py-2.5 bg-[#1E1E1E] text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Pre-order banner alert if items have preorder */}
              {hasPreorderItems && (
                <div className="p-3 bg-[#FDF2F8] border border-[#FBCFE8] rounded-xl text-xs text-[#831843] flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#E11D48] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Pre-Order Reservation Active</span>
                    <span className="text-[11px] text-[#9D174D]">
                      Pre-order items require a 60% advance payment now. The remaining 40% is due when your batch arrives in Dhaka.
                    </span>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const isPre = item.product.status === 'PRE_ORDER' || item.product.preorderSettings?.isPreorder;
                  const itemImg = item.product.images[0]?.url;

                  return (
                    <div key={item.id} className="py-3.5 flex gap-3.5 items-start">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No img
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-[#1E1E1E] truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-[#E11D48] transition-colors p-0.5"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Variant info */}
                        {item.variant && (
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Variant: <span className="font-medium text-gray-700">{item.variant.name}</span>
                          </div>
                        )}

                        {/* Status label */}
                        <div className="text-[10px] font-medium mt-1">
                          {isPre ? (
                            <span className="text-[#BE185D] inline-flex items-center gap-1">
                              ● Pre-Order (60% advance)
                            </span>
                          ) : (
                            <span className="text-emerald-700 inline-flex items-center gap-1">
                              ● In Stock
                            </span>
                          )}
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-md bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-gray-500 hover:text-black"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-gray-500 hover:text-black"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-[#1E1E1E] tabular-nums">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon input */}
              <div className="pt-2 border-t border-gray-200">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold">{appliedCoupon.code}</span>
                      <span>(-{formatCurrency(couponDiscount)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-emerald-700 hover:text-emerald-900 underline font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon Code (e.g. TRENDY10)"
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black uppercase"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponMessage && (
                  <p className="text-[11px] mt-1 text-gray-600">{couponMessage}</p>
                )}
              </div>

              {/* Shipping Zone Selector */}
              <div className="pt-2 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Shipping Destination:
                </label>
                <div className="space-y-1.5">
                  {settings.shippingZones.map((zone) => (
                    <label
                      key={zone.id}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        selectedShippingZone.id === zone.id
                          ? 'border-[#1E1E1E] bg-white font-medium shadow-xs'
                          : 'border-gray-200 bg-white/60 hover:bg-white text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shippingZone"
                          checked={selectedShippingZone.id === zone.id}
                          onChange={() => setSelectedShippingZone(zone)}
                          className="accent-[#1E1E1E]"
                        />
                        <span>{zone.name}</span>
                      </div>
                      <span className="tabular-nums font-semibold">
                        {zone.freeShippingAbove && subtotal >= zone.freeShippingAbove
                          ? 'FREE'
                          : formatCurrency(zone.rate)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-gray-200 space-y-3">
              {/* Financial Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 tabular-nums">{formatCurrency(subtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
                    <span className="font-semibold tabular-nums">-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold text-[#1E1E1E]">
                  <span>Total Order Value</span>
                  <span className="tabular-nums">{formatCurrency(totalOrderAmount)}</span>
                </div>

                {/* Preorder split callout */}
                {hasPreorderItems && (
                  <div className="p-2.5 mt-2 bg-[#FAF9F6] border border-gray-200 rounded-lg space-y-1 text-xs">
                    <div className="flex justify-between text-[#831843] font-semibold">
                      <span>Pay Now (Advance + Delivery):</span>
                      <span className="tabular-nums text-sm font-bold text-[#BE185D]">{formatCurrency(payNowTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-[11px]">
                      <span>Remaining Balance (Due on Arrival):</span>
                      <span className="tabular-nums font-medium text-gray-700">{formatCurrency(remainingBalance)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigateToCheckout();
                }}
                className="w-full py-3 px-4 bg-[#1E1E1E] hover:bg-black text-white rounded-xl text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>{hasPreorderItems ? 'Proceed to Pre-Order' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Secure payment via bKash, Nagad, Rocket & Bank</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
