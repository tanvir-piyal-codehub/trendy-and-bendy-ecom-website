import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { db } from '../../services/db';
import { paymentService } from '../../services/payments';
import { Check, ShieldCheck, AlertCircle, Smartphone, Key } from 'lucide-react';
import { PaymentMethodConfig } from '../../types';

export const AdminSettings: React.FC = () => {
  const { settings, refreshStore } = useStore();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [address, setAddress] = useState(settings.address);
  const [advancePct, setAdvancePct] = useState(settings.defaultPreorderAdvancePercentage);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);

  // Payment methods local state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(settings.paymentMethods);

  // Shipping Rates
  const [dhakaRate, setDhakaRate] = useState(settings.shippingZones[0]?.rate || 70);
  const [nationwideRate, setNationwideRate] = useState(settings.shippingZones[1]?.rate || 130);

  const [saved, setSaved] = useState(false);

  const gatewayStatuses = paymentService.getAllGatewayStatuses(paymentMethods);

  const updateMethodField = (id: string, field: keyof PaymentMethodConfig, val: any) => {
    setPaymentMethods(methods =>
      methods.map(m => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedZones = settings.shippingZones.map((z, idx) => {
      if (idx === 0) return { ...z, rate: dhakaRate };
      if (idx === 1) return { ...z, rate: nationwideRate };
      return z;
    });

    db.updateSettings({
      businessName,
      contactEmail,
      contactPhone,
      address,
      currencySymbol,
      defaultPreorderAdvancePercentage: advancePct,
      paymentMethods,
      shippingZones: updatedZones
    }, 'Tanvir (Super Admin)');

    refreshStore();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Store Settings & Operations</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure business details, pre-order default advance percentage, delivery fees, and payment gateway vs manual TrxID modes.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Store settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Business Information */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-serif font-bold text-gray-900">General Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Hub Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5"
              />
            </div>
          </div>
        </div>

        {/* Pre-Order Default Settings */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-serif font-bold text-gray-900">Pre-Order Engine Defaults</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Default Advance Deposit Percentage (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={advancePct}
                onChange={(e) => setAdvancePct(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl p-2.5 font-mono font-bold"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Applies when a product does not specify a custom advance rate.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Integrations & Gateway Modes */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6 shadow-xs">
          <div>
            <h2 className="text-sm font-serif font-bold text-gray-900">
              Payment Integrations (bKash, Nagad, SSLCommerz & Manual TrxID)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Gateway API integrations are optional. When environment variables are not configured, the system automatically uses <strong>Manual TrxID Payment</strong> where customers send money to your personal/merchant account and submit their transaction reference.
            </p>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((method) => {
              const gwStatus = gatewayStatuses.find(g => g.method === method.id);
              const isGatewayMethod = method.id === 'BKASH' || method.id === 'NAGAD' || method.id === 'SSLCOMMERZ';

              return (
                <div key={method.id} className="p-4 bg-[#FAF9F6] border border-gray-200 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{method.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-gray-200 text-gray-800">
                        {method.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={method.enabled}
                          onChange={(e) => updateMethodField(method.id, 'enabled', e.target.checked)}
                          className="accent-black"
                        />
                        <span className="font-semibold text-gray-700">Enabled in Checkout</span>
                      </label>
                    </div>
                  </div>

                  {/* Gateway Status Badge for bKash, Nagad, SSLCommerz */}
                  {isGatewayMethod && gwStatus && (
                    <div className="text-xs space-y-1.5">
                      {gwStatus.isGatewayConfigured ? (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Gateway API credentials detected in environment.
                          </span>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">
                              Gateway credentials optional / not set ({gwStatus.missingEnvVars.join(', ')})
                            </span>
                            <span className="text-[11px] text-amber-800">
                              System is gracefully running in <strong>Manual TrxID Mode</strong>. Customers will pay to the account number below and submit their Transaction ID.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Account Number & Mode Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        {method.id === 'COD' ? 'Payment Type' : 'Account / Merchant Phone Number'}
                      </label>
                      <input
                        type="text"
                        value={method.accountNumber}
                        disabled={method.id === 'COD'}
                        onChange={(e) => updateMethodField(method.id, 'accountNumber', e.target.value)}
                        placeholder="e.g. 01712-345678"
                        className="w-full bg-white border border-gray-200 rounded-xl p-2 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Account Type / Label</label>
                      <input
                        type="text"
                        value={method.accountType}
                        onChange={(e) => updateMethodField(method.id, 'accountType', e.target.value)}
                        placeholder="Personal / Merchant / Agent"
                        className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs"
                      />
                    </div>

                    {isGatewayMethod && (
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-gray-700 mb-1">
                          Operational Payment Mode
                        </label>
                        <select
                          value={method.gatewayMode || 'MANUAL_TRXID'}
                          onChange={(e) => updateMethodField(method.id, 'gatewayMode', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-semibold"
                        >
                          <option value="MANUAL_TRXID">
                            Manual TrxID Payment (Customer sends money to number & enters TrxID) — Recommended & Default
                          </option>
                          <option
                            value="AUTOMATED_GATEWAY"
                            disabled={!gwStatus?.isGatewayConfigured}
                          >
                            Automated Online Gateway {!gwStatus?.isGatewayConfigured ? '(Requires API keys in .env)' : '(Active)'}
                          </option>
                        </select>
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-gray-700 mb-1">Instructions for Customers</label>
                      <input
                        type="text"
                        value={method.instructions}
                        onChange={(e) => updateMethodField(method.id, 'instructions', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping Rates */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-serif font-bold text-gray-900">Delivery Rates (৳)</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Inside Dhaka (৳)</label>
              <input
                type="number"
                value={dhakaRate}
                onChange={(e) => setDhakaRate(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Outside Dhaka / Nationwide (৳)</label>
              <input
                type="number"
                value={nationwideRate}
                onChange={(e) => setNationwideRate(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#1E1E1E] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          Save All Settings
        </button>
      </form>
    </div>
  );
};
