import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Clock, 
  Package, 
  Layers, 
  Users, 
  CreditCard, 
  Tag, 
  MessageSquare, 
  Sliders, 
  ShieldCheck, 
  FileText, 
  Store, 
  LogOut,
  Menu,
  X,
  Star,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Order } from '../../types';

import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminPreorders } from './AdminPreorders';
import { AdminProducts } from './AdminProducts';
import { AdminInventory } from './AdminInventory';
import { AdminCustomers } from './AdminCustomers';
import { AdminCoupons } from './AdminCoupons';
import { AdminCMS } from './AdminCMS';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminReviews } from './AdminReviews';
import { AdminMessages } from './AdminMessages';

interface AdminLayoutProps {
  onBackToStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStore }) => {
  const { currentUser, currentRole, switchRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'preorders', label: 'Pre-Order Batches', icon: Clock, highlight: true },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory Movements', icon: Layers },
    { id: 'customers', label: 'Customers CRM', icon: Users },
    { id: 'coupons', label: 'Coupons & Discounts', icon: Tag },
    { id: 'reviews', label: 'Review Moderation', icon: Star },
    { id: 'messages', label: 'Inquiries & Inbox', icon: MessageSquare },
    { id: 'cms', label: 'CMS & Homepage', icon: FileText },
    { id: 'settings', label: 'Settings & Accounts', icon: Sliders },
    { id: 'audit', label: 'Audit Security Log', icon: ShieldCheck }
  ];

  const handleSelectOrderFromDashboard = (ord: Order) => {
    setSelectedOrder(ord);
    setActiveTab('orders');
  };

  const handleResetData = () => {
    if (window.confirm('Reset database back to initial seed data?')) {
      db.resetToSeed();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#1E1E1E] text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 text-gray-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif font-bold text-sm tracking-wide">TRENDY & BENDY ADMIN</span>
        </div>

        <button
          onClick={onBackToStore}
          className="text-xs text-[#F472B6] font-semibold flex items-center gap-1"
        >
          <Store className="w-3.5 h-3.5" /> Storefront
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1E1E1E] text-[#D4D4D8] border-r border-[#27272A] shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand & Store Return */}
        <div className="p-6 border-b border-[#27272A] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-lg text-white tracking-tight">
              TRENDY & BENDY
            </span>
          </div>

          <button
            onClick={onBackToStore}
            className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-[#F472B6]" />
            <span>Return to Storefront</span>
          </button>
        </div>

        {/* Current Staff Role Badge */}
        <div className="px-6 py-4 border-b border-[#27272A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Staff Role:</span>
            <span className="text-[11px] font-bold text-[#F472B6]">
              {currentRole.replace('_', ' ')}
            </span>
          </div>
          <select
            value={currentRole}
            onChange={(e) => switchRole(e.target.value as any)}
            className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="SUPER_ADMIN">Super Admin (Tanvir)</option>
            <option value="ORDER_MANAGER">Order Manager</option>
            <option value="INVENTORY_MANAGER">Inventory Manager</option>
            <option value="CONTENT_MANAGER">Content Manager</option>
            <option value="CUSTOMER_SUPPORT">Customer Support</option>
          </select>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'orders') setSelectedOrder(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#BE185D] text-white shadow-md shadow-pink-900/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-[#F472B6]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#27272A] space-y-2">
          <button
            onClick={handleResetData}
            className="w-full py-2 px-3 text-left text-xs text-gray-400 hover:text-white flex items-center gap-2 rounded-lg hover:bg-white/5"
            title="Reset database back to initial seed data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={setActiveTab}
            onSelectOrder={handleSelectOrderFromDashboard}
          />
        )}
        {activeTab === 'orders' && (
          <AdminOrders
            selectedOrder={selectedOrder}
            onClearSelectedOrder={() => setSelectedOrder(null)}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
          />
        )}
        {activeTab === 'preorders' && <AdminPreorders />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'inventory' && <AdminInventory />}
        {activeTab === 'customers' && <AdminCustomers />}
        {activeTab === 'coupons' && <AdminCoupons />}
        {activeTab === 'reviews' && <AdminReviews />}
        {activeTab === 'messages' && <AdminMessages />}
        {activeTab === 'cms' && <AdminCMS />}
        {activeTab === 'settings' && <AdminSettings />}
        {activeTab === 'audit' && <AdminAuditLogs />}
      </main>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-[#1E1E1E] text-white p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <span className="font-serif font-bold text-sm">TRENDY & BENDY ADMIN</span>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <nav className="mt-6 space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold block ${
                      activeTab === item.id ? 'bg-[#BE185D] text-white' : 'text-gray-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-gray-800 space-y-2">
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  onBackToStore();
                }}
                className="w-full py-2 bg-white/10 rounded-xl text-xs font-semibold text-center block"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
