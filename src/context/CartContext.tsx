import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, ProductVariant, CartItem, ShippingZone, Coupon } from '../types';
import { db } from '../services/db';
import { useStore } from './StoreContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  couponMessage: string;
  applyCouponCode: (code: string) => boolean;
  removeCoupon: () => void;
  selectedShippingZone: ShippingZone;
  setSelectedShippingZone: (zone: ShippingZone) => void;
  // Computed financial totals:
  totalItemCount: number;
  subtotal: number;
  shippingFee: number;
  totalOrderAmount: number;
  hasPreorderItems: boolean;
  advanceAmountRequired: number;
  remainingBalance: number;
  payNowTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'tb_user_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, products } = useStore();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const [selectedShippingZone, setSelectedShippingZone] = useState<ShippingZone>(() => {
    return settings.shippingZones[0] || {
      id: 'dhaka_inside',
      name: 'Inside Dhaka',
      rate: 70,
      estimatedDays: '2–3 days',
      isActive: true
    };
  });

  // Keep cart in sync with localStorage and revalidate against latest product database
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to sync cart:', e);
    }
  }, [items]);

  // Add Item to cart
  const addItem = (product: Product, variant?: ProductVariant, quantity = 1) => {
    setItems(currentItems => {
      const variantKey = variant ? variant.id : 'default';
      const existingIdx = currentItems.findIndex(
        ci => ci.product.id === product.id && (ci.variant?.id || 'default') === variantKey
      );

      const effectivePrice = (product.salePrice ?? product.regularPrice) + (variant?.priceAdjustment ?? 0);

      if (existingIdx >= 0) {
        const next = [...currentItems];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity
        };
        return next;
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${variantKey}-${Date.now()}`,
          product,
          variant,
          quantity,
          price: effectivePrice
        };
        return [...currentItems, newItem];
      }
    });
    setIsCartOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems(items => items.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(items =>
      items.map(i => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage('');
  };

  // Revalidate prices and compute totals dynamically
  const {
    totalItemCount,
    subtotal,
    hasPreorderItems,
    preorderAdvanceRequired,
    inStockTotal
  } = useMemo(() => {
    let count = 0;
    let sub = 0;
    let hasPre = false;
    let preAdvance = 0;
    let inStock = 0;

    items.forEach(item => {
      // Find fresh product from store
      const freshProd = products.find(p => p.id === item.product.id) || item.product;
      const basePrice = (freshProd.salePrice ?? freshProd.regularPrice) + (item.variant?.priceAdjustment ?? 0);
      const lineTotal = basePrice * item.quantity;

      count += item.quantity;
      sub += lineTotal;

      if (freshProd.status === 'PRE_ORDER' || freshProd.preorderSettings?.isPreorder) {
        hasPre = true;
        const advancePct = freshProd.preorderSettings?.advancePercentage ?? settings.defaultPreorderAdvancePercentage ?? 60;
        preAdvance += Math.round((lineTotal * advancePct) / 100);
      } else {
        inStock += lineTotal;
      }
    });

    return {
      totalItemCount: count,
      subtotal: sub,
      hasPreorderItems: hasPre,
      preorderAdvanceRequired: preAdvance,
      inStockTotal: inStock
    };
  }, [items, products, settings.defaultPreorderAdvancePercentage]);

  // Shipping Fee calculation (Check if free shipping applies)
  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    if (selectedShippingZone.freeShippingAbove && subtotal >= selectedShippingZone.freeShippingAbove) {
      return 0;
    }
    return selectedShippingZone.rate;
  }, [subtotal, selectedShippingZone]);

  // Revalidate coupon whenever subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      const res = db.validateCoupon(appliedCoupon.code, subtotal);
      if (res.valid) {
        setCouponDiscount(res.discountAmount);
        setCouponMessage(res.message);
      } else {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponMessage(res.message);
      }
    }
  }, [subtotal, appliedCoupon]);

  const applyCouponCode = (code: string): boolean => {
    const res = db.validateCoupon(code, subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discountAmount);
      setCouponMessage(res.message);
      return true;
    } else {
      setCouponMessage(res.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage('');
  };

  const totalOrderAmount = Math.max(0, subtotal - couponDiscount + shippingFee);

  // Pay Now vs Remaining calculation:
  // If pre-order only: Pay Now = Advance Required + Shipping Fee. Remaining = Total - Pay Now.
  // If mixed: Pay Now = Preorder Advance + In-stock total - discount + shippingFee.
  const advanceAmountRequired = useMemo(() => {
    if (!hasPreorderItems) return 0;
    return preorderAdvanceRequired;
  }, [hasPreorderItems, preorderAdvanceRequired]);

  const payNowTotal = useMemo(() => {
    if (totalOrderAmount === 0) return 0;
    if (!hasPreorderItems) {
      return totalOrderAmount;
    }
    // Preorder requires advance + full shipping + full in-stock products
    const required = preorderAdvanceRequired + inStockTotal - couponDiscount + shippingFee;
    return Math.max(0, Math.min(required, totalOrderAmount));
  }, [totalOrderAmount, hasPreorderItems, preorderAdvanceRequired, inStockTotal, couponDiscount, shippingFee]);

  const remainingBalance = Math.max(0, totalOrderAmount - payNowTotal);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
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
        totalItemCount,
        subtotal,
        shippingFee,
        totalOrderAmount,
        hasPreorderItems,
        advanceAmountRequired,
        remainingBalance,
        payNowTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
