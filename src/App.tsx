import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchModal } from './components/common/SearchModal';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { WishlistPage } from './pages/WishlistPage';
import { ContactPage } from './pages/ContactPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { AdminLayout } from './pages/admin/AdminLayout';

import { Product, ProductVariant, Order } from './types';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParam, setPageParam] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { addItem, setIsCartOpen } = useCart();

  const handleNavigate = (page: string, param?: string) => {
    setCurrentPage(page);
    setPageParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyNow = (product: Product, variant?: ProductVariant, quantity = 1) => {
    addItem(product, variant, quantity);
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
    setCurrentPage('order-success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin mode, render Admin Layout
  if (currentPage === 'admin') {
    return <AdminLayout onBackToStore={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1E1E1E]">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => handleNavigate('checkout')}
        onNavigateToShop={() => handleNavigate('shop')}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigateToCategory={(catSlug) => handleNavigate('category', catSlug)}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'shop' && (
          <ShopPage
            initialCategory={pageParam}
            initialType="all"
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'preorder' && (
          <ShopPage
            initialCategory={pageParam}
            initialType="preorder"
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'category' && (
          <ShopPage
            initialCategory={pageParam}
            initialType="all"
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'product' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onBuyNow={handleBuyNow}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {currentPage === 'order-success' && completedOrder && (
          <OrderSuccessPage
            order={completedOrder}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'track' && (
          <TrackOrderPage
            initialOrderNumber={pageParam}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'account' && (
          <CustomerAccountPage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'wishlist' && (
          <WishlistPage
            onNavigateToShop={() => handleNavigate('shop')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'policies' && <PoliciesPage initialTab={pageParam || 'preorder'} />}

        {currentPage === 'instagram' && (
          <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Instagram Social Commerce</h1>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              Trendy & Bendy was born on Instagram. Discover viral aesthetic clips, styling ideas, and active pre-order drops.
            </p>
            <div className="pt-4">
              <a
                href="https://www.instagram.com/trendy_.and_.bendy/"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-[#1E1E1E] hover:bg-black text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-md transition-colors"
              >
                <span>Open @trendy_.and_.bendy on Instagram</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </CartProvider>
    </StoreProvider>
  );
}
