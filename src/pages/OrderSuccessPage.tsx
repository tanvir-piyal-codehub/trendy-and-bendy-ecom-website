import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Printer, 
  ArrowRight, 
  Instagram, 
  MapPin, 
  Phone, 
  Mail, 
  PackageCheck,
  ShieldCheck
} from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface OrderSuccessPageProps {
  order: Order;
  onNavigate: (page: string, param?: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order, onNavigate }) => {
  const { formatCurrency, settings } = useStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Top Congratulation Banner */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
            Order Successfully Placed
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1E1E] mt-1">
            Thank you, {order.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-2">
            Your order has been recorded. Our team will verify your transaction details shortly.
          </p>
        </div>

        {/* Order Number Box */}
        <div className="p-4 bg-[#FAF9F6] border border-gray-200 rounded-2xl inline-block text-left min-w-[280px]">
          <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
            Order Reference Number
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[#1E1E1E] tracking-tight">
            {order.orderNumber}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Placed on: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigate('track', order.orderNumber)}
            className="px-5 py-2.5 bg-[#1E1E1E] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors flex items-center gap-1.5"
          >
            <span>Track Order Progress</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Pre-order Specific Notice */}
      {order.hasPreorderItems && (
        <div className="p-6 bg-[#FDF2F8] border border-[#FBCFE8] rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#831843] uppercase tracking-wide">
            <Clock className="w-4 h-4 text-[#E11D48]" />
            <span>Pre-Order Batch Allocation Notice</span>
          </div>
          <p className="text-xs text-[#831843] leading-relaxed">
            Your 60% advance payment guarantees your custom drop allocation from the current batch.
            Estimated arrival at our Dhaka hub is <strong>35–45 days</strong> after the pre-order closes.
            The remaining balance of <strong>{formatCurrency(order.remainingBalance)}</strong> can be paid upon doorstep delivery.
          </p>
        </div>
      )}

      {/* Order Details & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer & Shipping Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-serif font-bold text-[#1E1E1E] pb-2 border-b border-gray-100">
            Delivery Details
          </h2>

          <div className="space-y-3 text-xs text-gray-700">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">{order.shippingAddress.fullName}</span>
                <span>{order.shippingAddress.addressLine}</span>
                {order.shippingAddress.area && <span>, {order.shippingAddress.area}</span>}
                <div>{order.shippingAddress.city}, {order.shippingAddress.district}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{order.customerPhone}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{order.customerEmail}</span>
            </div>

            <div className="pt-2 text-[11px] text-gray-500">
              Delivery zone: <strong>{order.shippingZone}</strong> ({order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)})
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-serif font-bold text-[#1E1E1E] pb-2 border-b border-gray-100">
            Payment & Balance Summary
          </h2>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-semibold text-gray-900">{order.paymentMethod}</span>
            </div>

            {order.paymentDetails.transactionId && (
              <div className="flex justify-between">
                <span>Transaction ID (TrxID):</span>
                <span className="font-mono font-bold text-gray-900">{order.paymentDetails.transactionId}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Total Order Value:</span>
              <span className="font-mono font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-emerald-700">
              <span>Advance Paid / Submitted:</span>
              <span className="font-mono font-bold">{formatCurrency(order.advancePaid)}</span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-sm text-[#1E1E1E]">
              <span>Outstanding Balance Due:</span>
              <span className="font-mono text-[#BE185D]">
                {order.remainingBalance === 0 ? 'Fully Paid' : formatCurrency(order.remainingBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-[#FAF9F6] border-b border-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wide">
          Ordered Items
        </div>
        <div className="divide-y divide-gray-100 p-6">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <span className="font-semibold text-gray-900 block">{item.productName}</span>
                  <span className="text-[11px] text-gray-500">
                    {item.variantName || 'Standard'} × {item.quantity}
                  </span>
                  {item.isPreorder && (
                    <span className="text-[10px] text-[#BE185D] block font-medium">
                      Pre-order item (60% advance)
                    </span>
                  )}
                </div>
              </div>
              <span className="font-mono font-bold text-gray-900 tabular-nums">
                {formatCurrency(item.itemTotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Support Strip */}
      <div className="p-4 bg-gray-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Instagram className="w-4 h-4 text-[#BE185D]" />
          <span>Have questions about your order? Message us on Instagram <strong>@trendy_.and_.bendy</strong></span>
        </div>
        <button
          onClick={() => onNavigate('shop')}
          className="text-xs font-semibold text-[#1E1E1E] hover:underline"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};
