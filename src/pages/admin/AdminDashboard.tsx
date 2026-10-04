import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  CreditCard, 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { db } from '../../services/db';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onSelectOrder: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onSelectOrder
}) => {
  const { formatCurrency } = useStore();
  const orders = db.getOrders();
  const products = db.getProducts();
  const customers = db.getCustomers();

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.advancePaid || 0), 0);
  const totalOutstanding = orders.reduce((sum, o) => sum + (o.remainingBalance || 0), 0);
  const preorderOrders = orders.filter(o => o.hasPreorderItems);
  const pendingPayments = orders.filter(
    o => o.orderStatus === 'PAYMENT_VERIFICATION' || (o.paymentDetails.transactionId && o.paymentStatus !== 'PAID' && o.paymentStatus !== 'PARTIALLY_PAID')
  );
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.lowStockThreshold);

  const handleQuickVerify = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ord = db.getOrderById(orderId);
    if (!ord) return;
    db.verifyPayment(orderId, ord.advanceAmountRequired || ord.totalAmount, 'Admin Dashboard');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 bg-linear-to-r from-[#1E1E1E] to-[#27272A] rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#F472B6] font-semibold">
            Trendy & Bendy Operational Center
          </span>
          <h1 className="text-2xl font-serif font-bold text-white mt-1">
            Store Performance Overview
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Manage your social drops, active batch pre-orders, and payments in one place.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2 bg-[#BE185D] hover:bg-[#9D174D] text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            + Add Product
          </button>
          <button
            onClick={() => onNavigateTab('preorders')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs"
          >
            Pre-Order Batches
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected Revenue */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span>Collected Advance</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900 tabular-nums">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Real cash collected
          </span>
        </div>

        {/* Outstanding Pre-Order Balances */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[#BE185D] font-semibold">
            <span>Outstanding Balance</span>
            <Clock className="w-4 h-4 text-[#BE185D]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#BE185D] tabular-nums">
            {formatCurrency(totalOutstanding)}
          </div>
          <span className="text-[11px] text-gray-500">
            Due on batch arrival in Dhaka
          </span>
        </div>

        {/* Total Orders */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900 tabular-nums">
            {orders.length}
          </div>
          <span className="text-[11px] text-gray-500">
            {preorderOrders.length} pre-orders · {orders.length - preorderOrders.length} in-stock
          </span>
        </div>

        {/* Customers CRM */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span>Registered Customers</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900 tabular-nums">
            {customers.length}
          </div>
          <span className="text-[11px] text-purple-700 font-medium">
            Active Instagram Shoppers
          </span>
        </div>
      </div>

      {/* Action Queues: Pending Payments & Pre-orders Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payment Verification Queue */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-sm font-serif font-bold text-gray-900">
                Payment Verification Queue ({pendingPayments.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('payments')}
              className="text-xs text-[#BE185D] hover:underline font-semibold"
            >
              View All Payments
            </button>
          </div>

          {pendingPayments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {pendingPayments.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => onSelectOrder(ord)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50 p-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-900">{ord.orderNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                        {ord.paymentMethod}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      TrxID: <strong className="font-mono text-gray-800">{ord.paymentDetails.transactionId || 'None'}</strong> · Customer: {ord.customerName}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-gray-900 tabular-nums">
                      {formatCurrency(ord.advanceAmountRequired || ord.totalAmount)}
                    </span>
                    <button
                      onClick={(e) => handleQuickVerify(ord.id, e)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-3 h-3" /> Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-400">
              ✓ All payments have been cross-checked and verified!
            </div>
          )}
        </div>

        {/* Low Stock & Inventory Alerts */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-serif font-bold text-gray-900">
                Low Stock & Allocation Watchlist ({lowStockProducts.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-[#BE185D] hover:underline font-semibold"
            >
              Manage Inventory
            </button>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {p.images[0]?.url && (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block truncate max-w-xs">{p.name}</span>
                      <span className="text-[11px] text-gray-500">{p.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#E11D48] tabular-nums block">
                      {p.stockQuantity} remaining
                    </span>
                    <span className="text-[10px] text-gray-400">Threshold: {p.lowStockThreshold}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-400">
              All inventory levels healthy.
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-serif font-bold text-gray-900">
            Recent Orders
          </h2>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-[#BE185D] hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All {orders.length} Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-gray-600 border-b border-gray-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Order #</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Total</th>
                <th className="py-3 px-6">Advance Paid</th>
                <th className="py-3 px-6">Remaining</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0, 6).map((ord) => (
                <tr
                  key={ord.id}
                  onClick={() => onSelectOrder(ord)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-6 font-mono font-bold text-gray-900">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="font-semibold text-gray-900 block">{ord.customerName}</span>
                    <span className="text-[11px] text-gray-500">{ord.customerPhone}</span>
                  </td>
                  <td className="py-3.5 px-6">
                    {ord.hasPreorderItems ? (
                      <span className="px-2 py-0.5 rounded bg-[#FCE7F3] text-[#831843] text-[10px] font-bold">
                        Pre-Order
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-semibold">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 font-mono font-semibold tabular-nums text-gray-900">
                    {formatCurrency(ord.totalAmount)}
                  </td>
                  <td className="py-3.5 px-6 font-mono font-semibold tabular-nums text-emerald-700">
                    {formatCurrency(ord.advancePaid)}
                  </td>
                  <td className="py-3.5 px-6 font-mono tabular-nums text-gray-700 font-medium">
                    {ord.remainingBalance === 0 ? '—' : formatCurrency(ord.remainingBalance)}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="text-[11px] font-semibold text-gray-800">
                      {ord.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(ord);
                      }}
                      className="text-xs text-[#BE185D] hover:underline font-semibold"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
