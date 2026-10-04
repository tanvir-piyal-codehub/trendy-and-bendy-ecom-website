import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Check, 
  X, 
  Truck, 
  CreditCard, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { db } from '../../services/db';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus, PaymentMethod } from '../../types';

interface AdminOrdersProps {
  selectedOrder?: Order | null;
  onClearSelectedOrder: () => void;
  onSelectOrder: (order: Order) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  selectedOrder,
  onClearSelectedOrder,
  onSelectOrder
}) => {
  const { formatCurrency } = useStore();
  const [orders, setOrders] = useState<Order[]>(() => db.getOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal actions state
  const [newStatus, setNewStatus] = useState<OrderStatus>('CONFIRMED');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('Steadfast Courier');
  const [verifyAmount, setVerifyAmount] = useState<number>(0);
  const [adminNote, setAdminNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const refreshOrders = () => {
    setOrders(db.getOrders());
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'ALL' && o.orderStatus !== statusFilter) return false;
      if (typeFilter === 'PREORDER' && !o.hasPreorderItems) return false;
      if (typeFilter === 'INSTOCK' && o.hasPreorderItems) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          (o.paymentDetails.transactionId && o.paymentDetails.transactionId.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [orders, statusFilter, typeFilter, searchQuery]);

  // Open modal with current order values
  const activeOrder = selectedOrder ? orders.find(o => o.id === selectedOrder.id) || selectedOrder : null;

  React.useEffect(() => {
    if (activeOrder) {
      setNewStatus(activeOrder.orderStatus);
      setVerifyAmount(activeOrder.remainingBalance > 0 ? activeOrder.advanceAmountRequired : activeOrder.totalAmount);
      setTrackingNumber(activeOrder.trackingNumber || '');
      setCourierName(activeOrder.courier || 'Steadfast Courier');
      setStatusNote('');
    }
  }, [activeOrder]);

  const handleStatusUpdate = () => {
    if (!activeOrder) return;
    db.updateOrderStatus(activeOrder.id, newStatus, 'Tanvir (Admin)', statusNote || undefined);
    refreshOrders();
    setActionSuccess('Status updated successfully!');
    setTimeout(() => setActionSuccess(''), 2000);
  };

  const handleVerifyPayment = () => {
    if (!activeOrder) return;
    db.verifyPayment(activeOrder.id, verifyAmount, 'Tanvir (Admin)', adminNote || 'Payment confirmed via statement.');
    refreshOrders();
    setActionSuccess('Payment verified & recorded!');
    setTimeout(() => setActionSuccess(''), 2000);
  };

  const handleSaveTracking = () => {
    if (!activeOrder || !trackingNumber.trim()) return;
    const ord = db.getOrderById(activeOrder.id);
    if (ord) {
      ord.trackingNumber = trackingNumber.trim();
      ord.courier = courierName;
      ord.orderStatus = 'SHIPPED';
      ord.timeline.push({
        status: 'SHIPPED',
        title: `Dispatched via ${courierName} (Tracking # ${trackingNumber.trim()})`,
        timestamp: new Date().toISOString(),
        actor: 'Tanvir (Admin)'
      });
      db.updateOrderStatus(ord.id, 'SHIPPED', 'Tanvir (Admin)', `Tracking #${trackingNumber.trim()}`);
      refreshOrders();
      setActionSuccess('Tracking ID assigned and marked as Shipped!');
      setTimeout(() => setActionSuccess(''), 2000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Email', 'Total Amount', 'Advance Paid', 'Remaining Balance', 'Status', 'Payment Method', 'TrxID'];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      o.customerEmail,
      o.totalAmount,
      o.advancePaid,
      o.remainingBalance,
      o.orderStatus,
      o.paymentMethod,
      o.paymentDetails.transactionId || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trendy_bendy_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track order fulfillment, verify advance deposits, assign courier numbers, and settle remaining balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV ({filteredOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Name, Phone or TrxID..."
            className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black"
          />
        </div>

        {/* Dropdown filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF9F6] border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-medium focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAYMENT_VERIFICATION">Payment Verification</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREORDER_CONFIRMED">Pre-Order Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#FAF9F6] border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-medium focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="PREORDER">Pre-Order Only</option>
              <option value="INSTOCK">In-Stock Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-gray-600 border-b border-gray-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Order #</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Destination</th>
                <th className="py-3 px-5">Total</th>
                <th className="py-3 px-5">Advance Paid</th>
                <th className="py-3 px-5">Remaining</th>
                <th className="py-3 px-5">Payment Method</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => onSelectOrder(ord)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono font-bold text-gray-900">
                      {ord.orderNumber}
                      {ord.hasPreorderItems && (
                        <span className="block text-[10px] text-[#BE185D] font-sans font-semibold">
                          Pre-Order
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-gray-500">
                      {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-gray-900 block">{ord.customerName}</span>
                      <span className="text-[11px] text-gray-500 font-mono">{ord.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-600">
                      {ord.shippingAddress.city}, {ord.shippingAddress.district}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold tabular-nums text-gray-900">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-semibold tabular-nums text-emerald-700">
                      {formatCurrency(ord.advancePaid)}
                    </td>
                    <td className="py-3.5 px-5 font-mono tabular-nums text-gray-700">
                      {ord.remainingBalance === 0 ? (
                        <span className="text-emerald-700 font-semibold">Paid in Full</span>
                      ) : (
                        formatCurrency(ord.remainingBalance)
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-gray-800">{ord.paymentMethod}</span>
                      {ord.paymentDetails.transactionId && (
                        <span className="block text-[10px] font-mono text-gray-500">
                          {ord.paymentDetails.transactionId}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'PREORDER_CONFIRMED'
                            ? 'bg-[#FCE7F3] text-[#831843]'
                            : ord.orderStatus === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.orderStatus === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(ord);
                        }}
                        className="text-xs font-semibold text-[#BE185D] hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-gray-400">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onClearSelectedOrder}
          />
          <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-mono font-bold text-gray-900">{activeOrder.orderNumber}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FCE7F3] text-[#831843]">
                    {activeOrder.orderStatus.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Placed on {new Date(activeOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={onClearSelectedOrder}
                className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#FAF9F6] border border-gray-200 rounded-2xl text-xs">
              <div>
                <span className="text-gray-500 block uppercase font-semibold text-[10px]">Customer</span>
                <span className="font-bold text-gray-900 block">{activeOrder.customerName}</span>
                <span className="text-gray-600 font-mono">{activeOrder.customerPhone}</span>
                <span className="text-gray-500 block">{activeOrder.customerEmail}</span>
              </div>

              <div>
                <span className="text-gray-500 block uppercase font-semibold text-[10px]">Shipping Address</span>
                <span className="text-gray-800 block">{activeOrder.shippingAddress.addressLine}</span>
                <span className="text-gray-600 block">{activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.district}</span>
                <span className="text-gray-500 block">Zone: {activeOrder.shippingZone}</span>
              </div>

              <div>
                <span className="text-gray-500 block uppercase font-semibold text-[10px]">Payment Overview</span>
                <span className="font-semibold text-gray-900 block">
                  Method: {activeOrder.paymentMethod}
                </span>
                <div className="flex justify-between text-xs mt-1">
                  <span>Advance:</span>
                  <strong className="text-emerald-700 font-mono">{formatCurrency(activeOrder.advancePaid)}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Remaining:</span>
                  <strong className="text-[#BE185D] font-mono">{formatCurrency(activeOrder.remainingBalance)}</strong>
                </div>
              </div>
            </div>

            {/* Items in order */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Order Items</h3>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {activeOrder.items.map((i) => (
                  <div key={i.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <span className="font-semibold text-gray-900">{i.productName}</span>
                      <span className="text-gray-500 text-[11px] block">
                        {i.variantName || 'Standard'} × {i.quantity}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-gray-900">{formatCurrency(i.itemTotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION MODULE 1: Verify Payment */}
            <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verify Payment / Advance Deposit</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Submitted TrxID:
                  </label>
                  <span className="font-mono font-bold bg-gray-100 px-3 py-1.5 rounded-lg block text-gray-900">
                    {activeOrder.paymentDetails.transactionId || 'None entered'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Verified Amount (৳):
                  </label>
                  <input
                    type="number"
                    value={verifyAmount}
                    onChange={(e) => setVerifyAmount(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg p-1.5 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleVerifyPayment}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs"
                >
                  Confirm & Verify Payment (৳{verifyAmount.toLocaleString()})
                </button>
              </div>
            </div>

            {/* ACTION MODULE 2: Assign Courier Tracking */}
            <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-700" />
                <span>Dispatch / Courier Tracking</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Courier Partner</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs"
                  >
                    <option value="Steadfast Courier">Steadfast Courier</option>
                    <option value="Pathao Courier">Pathao Courier</option>
                    <option value="eCourier">eCourier</option>
                    <option value="RedX">RedX</option>
                    <option value="Internal Banani Hub Rider">Internal Hub Rider</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. STEADFAST-99120"
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveTracking}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs"
                >
                  Save Tracking & Mark Shipped
                </button>
              </div>
            </div>

            {/* ACTION MODULE 3: Change Status */}
            <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Update Order Lifecycle Status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAYMENT_VERIFICATION">Payment Verification</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PREORDER_CONFIRMED">Pre-Order Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="READY_TO_SHIP">Ready to Ship</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Timeline Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Batch customs clearance passed at Dhaka airport"
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-[#1E1E1E] hover:bg-black text-white rounded-xl text-xs font-semibold"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
