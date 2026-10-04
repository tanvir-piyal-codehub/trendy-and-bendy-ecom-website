import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  AlertCircle, 
  CreditCard,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { db } from '../services/db';
import { Order, PaymentMethod } from '../types';
import { useStore } from '../context/StoreContext';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderNumber, onNavigate }) => {
  const { formatCurrency, settings } = useStore();
  const [searchInput, setSearchInput] = useState(initialOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  // Remaining balance settlement modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('BKASH');
  const [payTrxId, setPayTrxId] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    if (initialOrderNumber) {
      handleLookup(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleLookup = (query: string) => {
    const q = query.trim();
    if (!q) return;
    setSearched(true);
    const found = db.getOrderById(q);
    setOrder(found || null);
    if (found) {
      setPayAmount(found.remainingBalance);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(searchInput);
  };

  const handleSettleRemainingBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !payTrxId) return;

    db.recordRemainingPayment(order.id, payAmount, payMethod, payTrxId, 'Customer Self-Service');
    const updated = db.getOrderById(order.id);
    if (updated) setOrder(updated);

    setPaySuccess(true);
    setTimeout(() => {
      setPaySuccess(false);
      setShowPayModal(false);
      setPayTrxId('');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1E1E1E]">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Enter your Order Number (e.g. <strong>TB-2026-000101</strong>) to view real-time batch timeline and courier status.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="max-w-xl mx-auto bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              placeholder="e.g. TB-2026-000101"
              required
              className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-black uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#1E1E1E] hover:bg-black text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {/* Results Area */}
      {searched && !order && (
        <div className="p-8 bg-white border border-gray-200 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-semibold text-gray-900">Order Not Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            We couldn't find an order matching "{searchInput}". Please double check your order number or contact support on Instagram.
          </p>
        </div>
      )}

      {order && (
        <div className="space-y-8">
          {/* Main Status Header Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-mono font-bold text-[#1E1E1E]">
                  {order.orderNumber}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#FCE7F3] text-[#831843]">
                  {order.orderStatus.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Financial balance status button */}
            <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
              <div className="text-right">
                <span className="text-[11px] text-gray-400 block uppercase font-semibold">Remaining Balance</span>
                <span className="text-base font-bold font-mono text-[#BE185D] tabular-nums">
                  {order.remainingBalance === 0 ? 'Fully Paid' : formatCurrency(order.remainingBalance)}
                </span>
              </div>

              {order.remainingBalance > 0 && (
                <button
                  onClick={() => setShowPayModal(true)}
                  className="px-4 py-2 bg-[#BE185D] hover:bg-[#9D174D] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Pay Balance
                </button>
              )}
            </div>
          </div>

          {/* Courier Information if available */}
          {order.trackingNumber && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-emerald-700" />
                <div>
                  <span className="font-semibold block">Dispatched via {order.courier || 'Courier'}</span>
                  <span className="font-mono text-[11px]">Tracking ID: {order.trackingNumber}</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-white rounded-lg text-emerald-800 font-semibold shadow-2xs">
                In Transit
              </span>
            </div>
          )}

          {/* Interactive Timeline */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base font-serif font-bold text-[#1E1E1E]">Order Timeline</h2>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {order.timeline.map((evt, idx) => {
                const isLatest = idx === order.timeline.length - 1;
                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Circle Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 transition-colors ${
                        isLatest
                          ? 'border-[#BE185D] bg-[#BE185D] ring-4 ring-pink-100'
                          : 'border-emerald-600 bg-emerald-600'
                      }`}
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{evt.title}</span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {evt.note && (
                        <p className="text-xs text-gray-600 leading-relaxed bg-[#FAF9F6] p-2.5 rounded-lg border border-gray-100">
                          {evt.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Summary in tracked order */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#1E1E1E]">Parcel Contents</h3>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900 block">{item.productName}</span>
                    <span className="text-[11px] text-gray-500">
                      {item.variantName || 'Standard'} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-gray-900 tabular-nums">
                    {formatCurrency(item.itemTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settle Remaining Balance Modal */}
      {showPayModal && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowPayModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-gray-900">
              Settle Remaining Balance
            </h3>

            {paySuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium text-center">
                ✨ Balance payment submitted! Our team will verify it shortly.
              </div>
            ) : (
              <form onSubmit={handleSettleRemainingBalance} className="space-y-4">
                <div className="p-3 bg-[#FDF2F8] border border-[#FBCFE8] rounded-xl text-xs space-y-1">
                  <span className="text-gray-600 block">Remaining Balance:</span>
                  <span className="text-lg font-mono font-bold text-[#BE185D]">
                    {formatCurrency(order.remainingBalance)}
                  </span>
                  <p className="text-[11px] text-gray-500 pt-1">
                    Send to our <strong>{settings.paymentMethods[0].name}</strong> account:{' '}
                    <span className="font-mono font-bold">{settings.paymentMethods[0].accountNumber}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-black"
                  >
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="SSLCOMMERZ">SSLCommerz / Direct Card</option>
                    <option value="ROCKET">Rocket</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Transaction ID (TrxID) <span className="text-[#E11D48]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payTrxId}
                    onChange={(e) => setPayTrxId(e.target.value.toUpperCase())}
                    placeholder="e.g. 9A7K8LM2QP"
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs uppercase font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#BE185D] hover:bg-[#9D174D] text-white text-xs font-semibold rounded-lg"
                  >
                    Submit Payment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
