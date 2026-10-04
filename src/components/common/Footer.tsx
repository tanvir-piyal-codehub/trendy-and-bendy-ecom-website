import React, { useState } from 'react';
import { Instagram, Send, Heart, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { db } from '../../services/db';

interface FooterProps {
  onNavigate: (page: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    db.subscribeNewsletter(newsletterEmail);
    setSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-[#18181B] text-[#E4E4E7] pt-16 pb-12 border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#27272A]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
              TRENDY & BENDY
            </h2>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Curated viral aesthetic finds, nostalgic tech, and exclusive pre-order drops.
              Connecting social-commerce culture with seamless doorstep delivery across Bangladesh.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#27272A] hover:bg-[#3F3F46] text-xs text-white transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#F472B6]" />
                <span>@trendy_.and_.bendy</span>
                <ArrowUpRight className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">
              Explore Collections
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => onNavigate('preorder')}
                  className="hover:text-white transition-colors text-left text-[#F472B6] font-medium"
                >
                  Pre-Order Drops
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-white transition-colors text-left"
                >
                  All In-Stock Items
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'gadgets')}
                  className="hover:text-white transition-colors text-left"
                >
                  Aesthetic Gadgets
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'shoes')}
                  className="hover:text-white transition-colors text-left"
                >
                  Shoes & Heels
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'accessories')}
                  className="hover:text-white transition-colors text-left"
                >
                  Accessories & Charms
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-white transition-colors text-left"
                >
                  Track Your Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('policies', 'preorder')}
                  className="hover:text-white transition-colors text-left"
                >
                  How Pre-Orders Work
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('policies', 'shipping')}
                  className="hover:text-white transition-colors text-left"
                >
                  Shipping & Timelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('policies', 'returns')}
                  className="hover:text-white transition-colors text-left"
                >
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors text-left"
                >
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">
              Stay in the Drop Loop
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Be the first to know when new pre-order batches open and viral aesthetic drops land.
            </p>
            {subscribed ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs">
                ✨ Thank you! You will be notified on the next drop.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#F472B6]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1 bg-[#F472B6] hover:bg-[#EC4899] text-white rounded transition-colors"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  No spam ever. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Trendy & Bendy. All rights reserved.</span>
            <span>·</span>
            <span>Designed for Instagram Social Commerce</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400">Accepted Payments:</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-[#27272A] text-gray-300 text-[11px] font-medium">bKash</span>
              <span className="px-2 py-0.5 rounded bg-[#27272A] text-gray-300 text-[11px] font-medium">Nagad</span>
              <span className="px-2 py-0.5 rounded bg-[#27272A] text-gray-300 text-[11px] font-medium">Rocket</span>
              <span className="px-2 py-0.5 rounded bg-[#27272A] text-gray-300 text-[11px] font-medium">Bank</span>
              <span className="px-2 py-0.5 rounded bg-[#27272A] text-gray-300 text-[11px] font-medium">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
