import React, { useState } from 'react';
import { 
  User, 
  ShoppingBag, 
  Clock, 
  Heart, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db } from '../services/db';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';

interface CustomerAccountPageProps {
  onNavigate: (page: string, param?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({
  onNavigate,
  onSelectProduct
}) => {
  const { currentUser, currentRole, switchRole, logout, isAdmin } = useAuth();
  const { formatCurrency, wishlist, products } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'preorders' | 'wishlist' | 'profile'>('orders');

  const orders = db.getOrders();
  // Filter customer's orders if email matches, or show all for demo
  const userOrders = orders.filter(
    o => !currentUser?.email || o.customerEmail.toLowerCase() === currentUser.email.toLowerCase() || currentRole === 'SUPER_ADMIN'
  );

  const preorderOrders = userOrders.filter(o => o.hasPreorderItems);
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const outstandingBalance = userOrders.reduce((sum, o) => sum + o.remainingBalance, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Account Hero Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FCE7F3] text-[#831843] flex items-center justify-center text-xl font-bold font-serif">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1E1E1E]">
              Welcome back, {currentUser?.name || 'Customer'}!
            </h1>
            <p className="text-xs text-gray-500">{currentUser?.email || 'customer@gmail.com'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
                Role: {currentRole.replace('_', ' ')}
              </span>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-[11px] text-[#BE185D] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Open Admin Portal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Demo Role Switcher Strip (High-value feature for testing every persona) */}
        <div className="p-3 bg-[#FAF9F6] border border-gray-200 rounded-2xl flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-gray-700 text-[11px]">Demo Role Switcher:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => switchRole('SUPER_ADMIN')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                currentRole === 'SUPER_ADMIN' ? 'bg-[#1E1E1E] text-white' : 'bg-white border text-gray-700'
              }`}
            >
              Super Admin
            </button>
            <button
              onClick={() => switchRole('ORDER_MANAGER')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                currentRole === 'ORDER_MANAGER' ? 'bg-[#1E1E1E] text-white' : 'bg-white border text-gray-700'
              }`}
            >
              Order Manager
            </button>
            <button
              onClick={() => switchRole('CUSTOMER')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                currentRole === 'CUSTOMER' ? 'bg-[#1E1E1E] text-white' : 'bg-white border text-gray-700'
              }`}
            >
              Customer
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">Total Orders</span>
          <span className="text-2xl font-bold font-mono text-gray-900 mt-1 block tabular-nums">
            {userOrders.length}
          </span>
        </div>
        <div className="p-5 bg-white border border-gray-200 rounded-2xl">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">Total Spent</span>
          <span className="text-2xl font-bold font-mono text-gray-900 mt-1 block tabular-nums">
            {formatCurrency(totalSpent)}
          </span>
        </div>
        <div className="p-5 bg-white border border-gray-200 rounded-2xl">
          <span className="text-xs text-[#BE185D] uppercase tracking-wider font-semibold block">Active Pre-Orders</span>
          <span className="text-2xl font-bold font-mono text-[#BE185D] mt-1 block tabular-nums">
            {preorderOrders.length}
          </span>
        </div>
        <div className="p-5 bg-white border border-gray-200 rounded-2xl">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">Outstanding Balance</span>
          <span className="text-2xl font-bold font-mono text-gray-900 mt-1 block tabular-nums">
            {formatCurrency(outstandingBalance)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="flex border-b border-gray-200 bg-[#FAF9F6] px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-4 text-xs font-bold tracking-wide uppercase transition-colors relative whitespace-nowrap ${
              activeTab === 'orders' ? 'text-[#1E1E1E]' : 'text-gray-500 hover:text-black'
            }`}
          >
            All Orders ({userOrders.length})
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E1E]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('preorders')}
            className={`py-4 px-4 text-xs font-bold tracking-wide uppercase transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'preorders' ? 'text-[#BE185D]' : 'text-gray-500 hover:text-black'
            }`}
          >
            <span>Pre-Order Drops ({preorderOrders.length})</span>
            {activeTab === 'preorders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BE185D]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-4 px-4 text-xs font-bold tracking-wide uppercase transition-colors relative whitespace-nowrap ${
              activeTab === 'wishlist' ? 'text-[#1E1E1E]' : 'text-gray-500 hover:text-black'
            }`}
          >
            Saved Wishlist ({wishlistProducts.length})
            {activeTab === 'wishlist' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E1E]" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {userOrders.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {userOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-gray-900">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#FCE7F3] text-[#831843]">
                            {ord.orderStatus.replace('_', ' ')}
                          </span>
                          {ord.hasPreorderItems && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 font-semibold text-gray-700">
                              Pre-Order
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {ord.items.length} items · Placed on{' '}
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-gray-900 tabular-nums block">
                            {formatCurrency(ord.totalAmount)}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {ord.remainingBalance > 0
                              ? `Balance Due: ${formatCurrency(ord.remainingBalance)}`
                              : 'Fully Paid'}
                          </span>
                        </div>

                        <button
                          onClick={() => onNavigate('track', ord.orderNumber)}
                          className="px-3.5 py-2 bg-gray-100 hover:bg-[#1E1E1E] hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Track</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-gray-500">
                  No orders placed yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'preorders' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#FDF2F8] border border-[#FBCFE8] rounded-xl text-xs text-[#831843]">
                <strong>Pre-Order Policy Reminder:</strong> Pre-orders require 60% advance payment. Estimated arrival is 35–45 days after batch closes. You will receive an SMS and dashboard tracking update when your batch reaches Dhaka.
              </div>

              {preorderOrders.length > 0 ? (
                <div className="space-y-4">
                  {preorderOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 bg-white border border-gray-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-gray-900">{ord.orderNumber}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#BE185D] text-white">
                            60% Advance Paid
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {ord.items.map(i => i.productName).join(', ')}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Estimated Delivery: ~35–45 days after batch closes
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right text-xs">
                          <span className="text-gray-400 block uppercase font-semibold">Remaining Due</span>
                          <span className="text-sm font-bold font-mono text-[#BE185D]">
                            {formatCurrency(ord.remainingBalance)}
                          </span>
                        </div>

                        <button
                          onClick={() => onNavigate('track', ord.orderNumber)}
                          className="px-4 py-2 bg-[#1E1E1E] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors"
                        >
                          View Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-gray-500">
                  No pre-orders placed yet. Check out our active pre-order drops!
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-gray-500">
                  Your wishlist is empty. Tap the heart on products you love to save them here!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
