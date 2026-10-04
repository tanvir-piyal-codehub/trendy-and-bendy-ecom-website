import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, StoreSettings } from '../types';
import { db, subscribeToStore } from '../services/db';

interface StoreContextType {
  settings: StoreSettings;
  products: Product[];
  categories: Category[];
  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  formatCurrency: (amount: number) => string;
  refreshStore: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(() => db.getSettings());
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => db.getCategories());
  const [wishlist, setWishlist] = useState<string[]>(() => db.getWishlist());

  const loadAll = () => {
    setSettings(db.getSettings());
    setProducts(db.getProducts());
    setCategories(db.getCategories());
    setWishlist(db.getWishlist());
  };

  useEffect(() => {
    return subscribeToStore(loadAll);
  }, []);

  const toggleWishlist = (productId: string): boolean => {
    const added = db.toggleWishlist(productId);
    setWishlist(db.getWishlist());
    return added;
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const formatCurrency = (amount: number) => {
    const symbol = settings.currencySymbol || '৳';
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        products,
        categories,
        wishlist,
        toggleWishlist,
        isInWishlist,
        formatCurrency,
        refreshStore: loadAll
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
