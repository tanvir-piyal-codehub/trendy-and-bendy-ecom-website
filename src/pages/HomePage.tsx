import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock, ShieldCheck, Sparkles, Instagram, Heart, Star, Truck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { settings, products, categories, formatCurrency } = useStore();
  const { addItem } = useCart();

  // Split into pre-orders and in-stock
  const preorderProducts = products.filter(p => p.status === 'PRE_ORDER' || p.preorderSettings?.isPreorder);
  const inStockProducts = products.filter(p => p.status === 'IN_STOCK');

  // Preorder Countdown Timer logic (Targeting closest preorder closing date)
  const [timeLeft, setTimeLeft] = useState({ days: 18, hours: 8, minutes: 24, seconds: 12 });

  useEffect(() => {
    const targetDate = new Date('2026-10-25T23:59:59Z').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION (Campaign focal point with 16:9 imagery) */}
      <section className="relative min-h-[520px] sm:min-h-[600px] flex items-center justify-center overflow-hidden bg-[#1E1E1E]">
        {/* Background Image with Measured Contrast Scrim */}
        <div className="absolute inset-0">
          <img
            src={settings.heroBanner.backgroundImage || '/src/assets/images/hero_trendy_showcase_1791153752287.jpg'}
            alt="Trendy & Bendy Lifestyle Collection"
            className="w-full h-full object-cover object-center opacity-75 scale-102"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl space-y-6 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-[#FCE7F3]">
              <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
              <span>Autumn 2026 Batch Pre-Orders Open</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-white leading-[1.1] text-balance">
              {settings.heroBanner.heading}
            </h1>

            <p className="text-base sm:text-lg text-gray-200 font-light leading-relaxed max-w-xl text-balance">
              {settings.heroBanner.subheading}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('preorder')}
                className="px-6 py-3.5 bg-[#BE185D] hover:bg-[#9D174D] text-white rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase shadow-lg shadow-pink-900/30 transition-all flex items-center gap-2"
              >
                <span>{settings.heroBanner.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3.5 bg-white/90 hover:bg-white text-[#1E1E1E] rounded-xl text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-xs transition-colors"
              >
                {settings.heroBanner.secondaryButtonText || 'Browse In Stock'}
              </button>
            </div>

            {/* Quick Proof Strip */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs text-gray-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F472B6]" />
                <span>60% Advance Reservation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F472B6]" />
                <span>Nationwide Home Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F472B6]" />
                <span>Quality Inspected in Dhaka</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRE-ORDER SPOTLIGHT & COUNTDOWN BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 bg-[#FAF9F6] border border-[#E5E7EB] rounded-2xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BE185D]">
              <Clock className="w-3.5 h-3.5" />
              <span>Current Pre-Order Batch Closing Soon</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1E1E1E]">
              Reserve Your Drop with 60% Advance
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg">
              Locks your unit before factory import closes. Estimated arrival: 35–45 days after batch closes. Remaining 40% balance payable on delivery.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 sm:gap-3 text-center">
            <div className="w-16 sm:w-20 p-2 sm:p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-[#1E1E1E] tabular-nums">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Days</span>
            </div>
            <span className="text-xl font-bold text-gray-400">:</span>
            <div className="w-16 sm:w-20 p-2 sm:p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-[#1E1E1E] tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Hours</span>
            </div>
            <span className="text-xl font-bold text-gray-400">:</span>
            <div className="w-16 sm:w-20 p-2 sm:p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-[#1E1E1E] tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Mins</span>
            </div>
            <span className="text-xl font-bold text-gray-400">:</span>
            <div className="w-16 sm:w-20 p-2 sm:p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-[#BE185D] tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#BE185D] font-semibold">Secs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRE-ORDER DROPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#BE185D] mb-1">
              Active Reservation Drops
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1E1E] tracking-tight">
              Pre-Order Collection
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Guaranteed allocation for viral items. Pay only 60% today to secure your order.
            </p>
          </div>
          <button
            onClick={() => onNavigate('preorder')}
            className="text-xs font-semibold text-[#1E1E1E] hover:text-[#BE185D] inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View All Pre-Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {preorderProducts.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* 4. CATEGORY HIGHLIGHT CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1E1E] tracking-tight">
            Curated Aesthetics
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Shop by distinct aesthetics inspired by our Instagram community.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('category', cat.slug)}
              className="group relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer bg-gray-100 border border-gray-200"
            >
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-sm sm:text-base font-serif font-bold block">{cat.name}</span>
                <span className="text-[11px] text-gray-300 group-hover:text-[#FCE7F3] inline-flex items-center gap-1 mt-0.5">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. IN-STOCK ESSENTIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              Ready for 24h Dispatch
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1E1E] tracking-tight">
              In-Stock Favorites
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Everyday cute charms, vanity gadgets, and accessories ready to ship today.
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-[#1E1E1E] hover:text-[#BE185D] inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Browse All In-Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {inStockProducts.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* 6. HOW PRE-ORDERS WORK EXPLAINER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF9F6] border border-[#E5E7EB] rounded-2xl p-8 sm:p-12">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1E1E]">
              How Trendy & Bendy Pre-Orders Work
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Transparent, reliable, and verified from factory booking to your hands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-[#BE185D] block">STEP 01</span>
              <h3 className="text-sm font-semibold text-[#1E1E1E]">Choose & Select Variant</h3>
              <p className="text-xs text-gray-600">
                Browse exclusive drop items and pick your desired color, size, and quantity.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-[#BE185D] block">STEP 02</span>
              <h3 className="text-sm font-semibold text-[#1E1E1E]">Pay 60% Advance</h3>
              <p className="text-xs text-gray-600">
                Submit payment via bKash, Nagad, or Bank. Your slot is immediately locked upon verification.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-[#BE185D] block">STEP 03</span>
              <h3 className="text-sm font-semibold text-[#1E1E1E]">Batch Production & Import</h3>
              <p className="text-xs text-gray-600">
                Items arrive at our Banani Dhaka sorting hub within 35–45 days for quality check.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-[#BE185D] block">STEP 04</span>
              <h3 className="text-sm font-semibold text-[#1E1E1E]">Final 40% & Delivery</h3>
              <p className="text-xs text-gray-600">
                Pay remaining 40% online or via Cash on Delivery when courier arrives at your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INSTAGRAM / SEEN ON SOCIAL SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE7F3] text-[#831843] text-xs font-semibold mb-2">
            <Instagram className="w-3.5 h-3.5 text-[#F472B6]" />
            <span>@trendy_.and_.bendy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1E1E]">
            Seen on Instagram
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Tag us in your unboxings and aesthetic setups to get featured on our feed!
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src="/src/assets/images/retro_mp3_player_1791153763636.jpg"
              alt="Retro MP3 player reel"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <a
              href="https://www.instagram.com/trendy_.and_.bendy/"
              target="_blank"
              rel="noreferrer"
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5"
            >
              <Instagram className="w-4 h-4" /> View Reel
            </a>
          </div>

          <div className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src="/src/assets/images/mini_flip_phone_1791153774162.jpg"
              alt="Mini flip phone aesthetic"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <a
              href="https://www.instagram.com/trendy_.and_.bendy/"
              target="_blank"
              rel="noreferrer"
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5"
            >
              <Instagram className="w-4 h-4" /> View Post
            </a>
          </div>

          <div className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src="/src/assets/images/fashion_heels_1791153787400.jpg"
              alt="Fashion heels unboxing"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <a
              href="https://www.instagram.com/trendy_.and_.bendy/"
              target="_blank"
              rel="noreferrer"
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5"
            >
              <Instagram className="w-4 h-4" /> View Story
            </a>
          </div>

          <div className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src="/src/assets/images/lipstick_keychain_1791153799684.jpg"
              alt="Lipstick keychain styling"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <a
              href="https://www.instagram.com/trendy_.and_.bendy/"
              target="_blank"
              rel="noreferrer"
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5"
            >
              <Instagram className="w-4 h-4" /> View Reel
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1E1E] text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            <Instagram className="w-4 h-4 text-[#F472B6]" />
            <span>Follow @trendy_.and_.bendy on Instagram</span>
          </a>
        </div>
      </section>

      {/* 8. CUSTOMER LOVE / REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1E1E]">
            Loved by Our Community
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Real feedback from verified customers across Bangladesh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500 text-sm">
              {'★★★★★'}
            </div>
            <p className="text-xs text-gray-700 leading-relaxed italic">
              "Ordered the retro MP3 player during the first batch! The advance payment was super smooth via bKash, and it arrived in Dhaka right around day 38. The packaging was so cute!"
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-900">Samira R.</span>
              <span className="text-[11px] text-emerald-700 font-medium">Verified Buyer · Dhaka</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500 text-sm">
              {'★★★★★'}
            </div>
            <p className="text-xs text-gray-700 leading-relaxed italic">
              "The lipstick keychain charm is of amazing quality. The vegan leather feels buttery and the gold clasp is heavy and luxury. Got here in 2 days inside Dhaka!"
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-900">Ayesha S.</span>
              <span className="text-[11px] text-emerald-700 font-medium">Verified Buyer · Banani</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500 text-sm">
              {'★★★★★'}
            </div>
            <p className="text-xs text-gray-700 leading-relaxed italic">
              "Honestly the best experience ordering pre-order fashion. Having the order timeline updated when it landed in Dhaka gave me so much peace of mind!"
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-900">Nabila C.</span>
              <span className="text-[11px] text-emerald-700 font-medium">Verified Buyer · Chattogram</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
