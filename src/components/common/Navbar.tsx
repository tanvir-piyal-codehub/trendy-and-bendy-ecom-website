import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, User, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, onOpenSearch }) => {
  const { settings, wishlist } = useStore();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { currentUser, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  const navLinks = [
    { label: 'Shop All', page: 'shop' },
    { label: 'Pre-Order', page: 'preorder', highlight: true },
    { label: 'Gadgets', page: 'category', param: 'gadgets' },
    { label: 'Shoes', page: 'category', param: 'shoes' },
    { label: 'Accessories', page: 'category', param: 'accessories' },
    { label: 'Instagram', page: 'instagram' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E5E7EB]">
      {/* Announcement Bar */}
      {settings.announcementBar.enabled && !announcementDismissed && (
        <div className="bg-[#1E1E1E] text-white text-xs py-2 px-4 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="w-6" /> {/* spacer */}
            <div className="flex items-center gap-2 text-center text-xs tracking-wide">
              <span>{settings.announcementBar.text}</span>
              {settings.announcementBar.linkText && (
                <button
                  onClick={() => onNavigate('preorder')}
                  className="underline underline-offset-4 font-semibold hover:text-[#FCE7F3] inline-flex items-center gap-1 transition-colors"
                >
                  {settings.announcementBar.linkText}
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={() => setAnnouncementDismissed(true)}
              className="text-gray-400 hover:text-white p-1"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Top Bar - 3 Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-gray-700 hover:text-black"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="text-2xl font-serif font-bold tracking-tight text-[#1E1E1E] hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            TRENDY & BENDY
          </a>
        </div>

        {/* Zone 2: 4-6 Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4B5563]">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => onNavigate(link.page, link.param)}
              className={`transition-colors whitespace-nowrap relative py-1 hover:text-[#1E1E1E] ${
                currentPage === link.page ? 'text-[#1E1E1E] font-semibold' : ''
              } ${link.highlight ? 'text-[#BE185D] font-semibold hover:text-[#9D174D]' : ''}`}
            >
              {link.label}
              {link.highlight && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse align-middle" />
              )}
              {currentPage === link.page && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E1E]" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 Primary actions & utility icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Switcher / Badge */}
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FCE7F3] text-[#831843] text-xs font-semibold hover:bg-[#FBCFE8] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E11D48]" />
              Admin Panel
            </button>
          )}

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Search products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => onNavigate('wishlist')}
            className="p-2 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 transition-colors relative"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#E11D48] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Account */}
          <button
            onClick={() => onNavigate('account')}
            className="p-2 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Customer account"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Shopping Bag / Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 pl-3 pr-3.5 py-2 bg-[#1E1E1E] text-white rounded-full text-xs font-medium hover:bg-black transition-colors"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-semibold tabular-nums">{totalItemCount}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-[#FAF9F6] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <span className="text-xl font-serif font-bold text-[#1E1E1E]">TRENDY & BENDY</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-black rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isAdmin && (
                <div className="mt-4 p-3 bg-[#FCE7F3] rounded-lg">
                  <div className="text-xs font-semibold text-[#831843]">Logged in as Staff</div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('admin');
                    }}
                    className="mt-1.5 text-xs font-bold text-[#E11D48] underline flex items-center gap-1"
                  >
                    Open Admin Dashboard <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              <nav className="mt-6 space-y-4">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(link.page, link.param);
                    }}
                    className={`block w-full text-left text-lg font-medium py-1.5 transition-colors ${
                      link.highlight ? 'text-[#BE185D] font-semibold' : 'text-gray-800 hover:text-black'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('track');
                    }}
                    className="block w-full text-left py-1 hover:text-black"
                  >
                    Track Order
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('policies');
                    }}
                    className="block w-full text-left py-1 hover:text-black"
                  >
                    Pre-Order & Shipping Guide
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('contact');
                    }}
                    className="block w-full text-left py-1 hover:text-black"
                  >
                    Contact & WhatsApp
                  </button>
                </div>
              </nav>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-[#FCE7F3] text-[#831843] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#FBCFE8]"
              >
                <span>Follow @trendy_.and_.bendy on IG</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
