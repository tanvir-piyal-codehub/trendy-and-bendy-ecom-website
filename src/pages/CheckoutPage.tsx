import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Truck, 
  CreditCard, 
  ArrowRight, 
  Check, 
  AlertCircle,
  Lock,
  Copy,
  Info,
  Smartphone
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { paymentService } from '../services/payments';
import { Order, PaymentMethod, ShippingAddress, OrderItem } from '../types';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onNavigateToShop: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderSuccess,
  onNavigateToShop
}) => {
  const {
    items,
    subtotal,
    appliedCoupon,
    couponDiscount,
    shippingFee,
    selectedShippingZone,
    setSelectedShippingZone,
    totalOrderAmount,
    hasPreorderItems,
    advanceAmountRequired,
    payNowTotal,
    remainingBalance,
    clearCart
  } = useCart();

  const { formatCurrency, settings } = useStore();
  const { currentUser, loginAsCustomer } = useAuth();

  // Customer & Shipping Form State
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [addressLine, setAddressLine] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Payment State
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('BKASH');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatingGateway, setSimulatingGateway] = useState(false);

  const selectedMethodConfig = settings.paymentMethods.find(m => m.id === selectedMethod);
  const gatewayStatus = useMemo(() => {
    return paymentService.checkGatewayStatus(selectedMethod, selectedMethodConfig);
  }, [selectedMethod, selectedMethodConfig]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Your bag is empty</h2>
        <p className="text-sm text-gray-600">
          You don't have any items in your bag to checkout.
        </p>
        <button
          onClick={onNavigateToShop}
          className="px-6 py-3 bg-[#1E1E1E] text-white rounded-xl text-xs font-semibold hover:bg-black"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleCopyAccount = (acc: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(acc);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleSimulateGatewayPayment = () => {
    setSimulatingGateway(true);
    setTimeout(() => {
      const generatedTrx = `${selectedMethod.slice(0, 3)}-${Date.now().toString().slice(-6)}`;
      setTransactionId(generatedTrx);
      setSenderNumber(phone || '01712345678');
      setSimulatingGateway(false);
    }, 1200);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!fullName.trim() || !phone.trim() || !email.trim() || !addressLine.trim()) {
      setFormError('Please complete all required customer and delivery address fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Require Transaction ID for manual payment methods
    const isManualMode = gatewayStatus.activeMode === 'MANUAL_TRXID';
    if ((selectedMethodConfig?.requiresProof || isManualMode) && selectedMethod !== 'COD' && !transactionId.trim()) {
      setFormError(`Please enter your ${selectedMethodConfig?.name || selectedMethod} Transaction ID (TrxID) to confirm payment.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Save customer session if new
      loginAsCustomer(fullName, email, phone);

      const shippingAddress: ShippingAddress = {
        fullName,
        phone,
        email,
        addressLine,
        area,
        city,
        district,
        postalCode,
        deliveryNotes
      };

      // Map cart items into structured order items with advance calculations
      const orderItems: OrderItem[] = items.map((item) => {
        const isPre = item.product.status === 'PRE_ORDER' || item.product.preorderSettings?.isPreorder;
        const advancePct = item.product.preorderSettings?.advancePercentage ?? settings.defaultPreorderAdvancePercentage ?? 60;
        const lineTotal = item.price * item.quantity;
        const lineAdvance = isPre ? Math.round((lineTotal * advancePct) / 100) : 0;

        return {
          id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0]?.url || '',
          variantId: item.variant?.id,
          variantName: item.variant?.name,
          unitPrice: item.price,
          quantity: item.quantity,
          isPreorder: !!isPre,
          advancePercentage: isPre ? advancePct : 0,
          advanceRequired: lineAdvance,
          itemTotal: lineTotal
        };
      });

      const newOrder = db.createOrder({
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress,
        items: orderItems,
        subtotal,
        discount: couponDiscount,
        couponCode: appliedCoupon?.code,
        shippingFee,
        shippingZone: selectedShippingZone.name,
        totalAmount: totalOrderAmount,
        hasPreorderItems,
        advanceAmountRequired: payNowTotal,
        advancePaid: selectedMethod === 'COD' ? 0 : payNowTotal,
        remainingBalance: selectedMethod === 'COD' ? totalOrderAmount : remainingBalance,
        orderStatus: selectedMethod === 'COD' ? 'CONFIRMED' : hasPreorderItems ? 'PREORDER_CONFIRMED' : 'CONFIRMED',
        paymentStatus: selectedMethod === 'COD' ? 'PENDING' : remainingBalance === 0 ? 'PAID' : 'PARTIALLY_PAID',
        paymentMethod: selectedMethod,
        paymentDetails: {
          method: selectedMethod,
          transactionId: transactionId.trim() || undefined,
          senderNumber: senderNumber.trim() || undefined,
          paymentProofUrl: paymentProofUrl.trim() || undefined,
          amountPaid: selectedMethod === 'COD' ? 0 : payNowTotal,
          adminNotes: isManualMode
            ? `Manual TrxID submitted: ${transactionId.trim() || 'N/A'}. Awaiting staff cross-verification.`
            : `Online Gateway verified transaction.`
        },
        customerNotes: deliveryNotes.trim() || undefined
      });

      clearCart();
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setFormError('Failed to process order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1E1E1E]">Checkout</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Complete your delivery details and advance payment to confirm your order.
        </p>
      </div>

      {formError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Information */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-serif font-bold text-[#1E1E1E] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1E1E1E] text-white text-xs flex items-center justify-center font-sans">
                1
              </span>
              <span>Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-[#E11D48]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Samira Rahman"
                  className="w-full bg-[#FAF9F6] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number <span className="text-[#E11D48]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712-345678"
                  className="w-full bg-[#FAF9F6] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address <span className="text-[#E11D48]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="samira@gmail.com"
                  className="w-full bg-[#FAF9F6] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-serif font-bold text-[#1E1E1E] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1E1E1E] text-white text-xs flex items-center justify-center font-sans">
                2
              </span>
              <span>Delivery Address</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Street Address & House / Apt No. <span className="text-[#E11D48]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="House 42, Road 11, Block D, Apt 3B"
                  className="w-full bg-[#FAF9F6] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Area / Thana</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Banani / Gulshan"
                    className="w-full bg-[#FAF9F6] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dhaka"
                    className="w-full bg-[#FAF9F6] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Gazipur">Gazipur</option>
                    <option value="Narayanganj">Narayanganj</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barishal">Barishal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                    <option value="Cumilla">Cumilla</option>
                    <option value="Other">Other District</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Delivery Notes / Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Call before coming, leave at reception"
                  className="w-full bg-[#FAF9F6] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Speed & Zone */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-serif font-bold text-[#1E1E1E] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1E1E1E] text-white text-xs flex items-center justify-center font-sans">
                3
              </span>
              <span>Delivery Option</span>
            </h2>

            <div className="space-y-2">
              {settings.shippingZones.map((zone) => (
                <label
                  key={zone.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    selectedShippingZone.id === zone.id
                      ? 'border-[#1E1E1E] bg-[#FAF9F6] shadow-2xs font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="checkoutZone"
                      checked={selectedShippingZone.id === zone.id}
                      onChange={() => setSelectedShippingZone(zone)}
                      className="accent-black"
                    />
                    <div>
                      <div className="text-xs text-gray-900">{zone.name}</div>
                      <div className="text-[11px] text-gray-500">{zone.estimatedDays}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-900 tabular-nums">
                    {zone.freeShippingAbove && subtotal >= zone.freeShippingAbove
                      ? 'FREE'
                      : formatCurrency(zone.rate)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-serif font-bold text-[#1E1E1E] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1E1E1E] text-white text-xs flex items-center justify-center font-sans">
                4
              </span>
              <span>Payment Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {settings.paymentMethods.map((method) => {
                const isCodDisabled = method.id === 'COD' && hasPreorderItems;
                const mStatus = paymentService.checkGatewayStatus(method.id, method);
                const isGateway = mStatus.activeMode === 'AUTOMATED_GATEWAY';

                return (
                  <button
                    type="button"
                    key={method.id}
                    disabled={isCodDisabled}
                    onClick={() => {
                      setSelectedMethod(method.id);
                      setTransactionId('');
                    }}
                    className={`p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                      selectedMethod === method.id
                        ? 'border-[#1E1E1E] bg-[#FAF9F6] shadow-2xs font-semibold'
                        : isCodDisabled
                        ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold block text-gray-900">{method.name}</span>
                      <span className="text-[11px] text-gray-500">
                        {isGateway ? '⚡ Instant Gateway' : 'Manual TrxID Payment'}
                      </span>
                      {isCodDisabled && (
                        <span className="text-[10px] text-[#E11D48] block mt-1">
                          Not available for pre-orders
                        </span>
                      )}
                    </div>
                    {method.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#FCE7F3] text-[#831843] font-bold">
                        {method.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* AUTOMATED GATEWAY ACTIVE (Only when credentials are provided) */}
            {gatewayStatus.activeMode === 'AUTOMATED_GATEWAY' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 mt-4">
                <div className="flex items-center gap-2 text-xs text-emerald-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Secure Online Gateway Integration Active</span>
                </div>
                <p className="text-xs text-emerald-800">
                  {gatewayStatus.name} API credentials detected. You can complete payment instantly via the secure gateway portal.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSimulateGatewayPayment}
                    disabled={simulatingGateway || !!transactionId}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    {simulatingGateway ? 'Connecting to Gateway...' : transactionId ? '✓ Gateway Authorized' : `Pay ৳${payNowTotal.toLocaleString()} with ${gatewayStatus.name}`}
                  </button>
                  {transactionId && (
                    <span className="text-[11px] text-emerald-800 font-mono mt-1.5 block">
                      Authorized Gateway Ref: <strong>{transactionId}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* MANUAL TRXID MODE (Default when credentials aren't set) */}
            {gatewayStatus.activeMode === 'MANUAL_TRXID' && selectedMethod !== 'COD' && selectedMethodConfig && (
              <div className="p-4 bg-[#FDF2F8] border border-[#FBCFE8] rounded-xl space-y-4 mt-4">
                {/* Mode alert */}
                <div className="flex items-center gap-2 text-xs font-bold text-[#831843]">
                  <Smartphone className="w-4 h-4 text-[#E11D48]" />
                  <span>Manual Payment Mode (TrxID Verification)</span>
                </div>

                <div className="space-y-1 text-xs text-[#831843]">
                  <div className="font-bold flex items-center justify-between">
                    <span>Account Details:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(selectedMethodConfig.accountNumber)}
                      className="inline-flex items-center gap-1 text-[11px] text-[#BE185D] hover:underline"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedAccount ? 'Copied!' : 'Copy Number'}</span>
                    </button>
                  </div>
                  <p>{selectedMethodConfig.instructions}</p>
                  <div className="p-2.5 bg-white rounded-lg border border-[#FBCFE8] space-y-1 mt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">{selectedMethodConfig.name} Number:</span>
                      <strong className="font-mono text-sm text-gray-900">{selectedMethodConfig.accountNumber}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Amount to Send Now:</span>
                      <strong className="font-mono text-sm text-[#BE185D]">{formatCurrency(payNowTotal)}</strong>
                    </div>
                  </div>
                </div>

                {/* TrxID and Sender Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#FBCFE8]">
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Transaction ID (TrxID) <span className="text-[#E11D48]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      placeholder="e.g. 9A7K8LM2QP"
                      className="w-full bg-white border border-[#FBCFE8] rounded-lg p-2.5 text-xs text-gray-900 uppercase font-mono focus:outline-none focus:border-[#BE185D]"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Enter the transaction ID received in your SMS after sending money.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Sender Phone Number
                    </label>
                    <input
                      type="tel"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="e.g. 01819-223344"
                      className="w-full bg-white border border-[#FBCFE8] rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#BE185D]"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      The number from which you completed the payment.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#831843] bg-white/70 p-2 rounded-lg">
                  <Info className="w-3.5 h-3.5 shrink-0 text-[#BE185D]" />
                  <span>
                    Our order management team in Banani will manually cross-verify this TrxID within 1-3 hours.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <h2 className="text-base font-serif font-bold text-[#1E1E1E]">Order Summary</h2>

            {/* Items summary */}
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-gray-900 block truncate">{item.product.name}</span>
                    <span className="text-[11px] text-gray-500">
                      {item.variant ? item.variant.name : 'Standard'} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-gray-900 tabular-nums shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-4 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-gray-900 tabular-nums">{formatCurrency(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="font-mono font-semibold tabular-nums">-{formatCurrency(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-mono font-semibold text-gray-900 tabular-nums">
                  {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-[#1E1E1E]">
                <span>Total Order Value</span>
                <span className="font-mono tabular-nums">{formatCurrency(totalOrderAmount)}</span>
              </div>
            </div>

            {/* Pre-order Callout Box */}
            {hasPreorderItems && (
              <div className="p-4 bg-[#FDF2F8] border border-[#FBCFE8] rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#831843]">Pay Now (Advance + Delivery):</span>
                  <span className="text-base font-bold font-mono text-[#BE185D] tabular-nums">
                    {formatCurrency(payNowTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-gray-600">
                  <span>Balance Due on Delivery:</span>
                  <span className="font-mono font-semibold text-gray-800 tabular-nums">
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1E1E1E] hover:bg-black text-white rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Confirming Order...'
                  : hasPreorderItems
                  ? `Pay ৳${payNowTotal.toLocaleString()} Advance & Confirm`
                  : `Place Order (৳${payNowTotal.toLocaleString()})`}
              </span>
            </button>

            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>SSL & Bank Grade Encryption</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Manual payments are verified by our Dhaka team within 1-3 hours.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

