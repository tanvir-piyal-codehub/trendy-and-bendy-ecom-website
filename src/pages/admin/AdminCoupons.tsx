import React, { useState } from 'react';
import { Tag, Plus, Trash2, Check, X } from 'lucide-react';
import { db } from '../../services/db';
import { useStore } from '../../context/StoreContext';
import { Coupon, DiscountType } from '../../types';

export const AdminCoupons: React.FC = () => {
  const { formatCurrency } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>(() => db.getCoupons());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderValue, setMinOrderValue] = useState(1500);
  const [usageLimit, setUsageLimit] = useState(100);
  const [endDate, setEndDate] = useState('2026-12-31');

  const refresh = () => setCoupons(db.getCoupons());

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderValue,
      startDate: new Date().toISOString(),
      endDate: `${endDate}T23:59:59Z`,
      usageLimit,
      usageCount: 0,
      isActive: true
    };

    db.saveCoupon(newCoupon, 'Tanvir (Admin)');
    refresh();
    setIsModalOpen(false);
    setCode('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this coupon?')) {
      db.deleteCoupon(id, 'Tanvir (Admin)');
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Create percentage discounts, flat fee vouchers, or free shipping codes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#1E1E1E] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF9F6] text-gray-600 border-b border-gray-200 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-5">Code</th>
              <th className="py-3 px-5">Discount</th>
              <th className="py-3 px-5">Min Order</th>
              <th className="py-3 px-5">Usage Count</th>
              <th className="py-3 px-5">Valid Until</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3.5 px-5 font-mono font-bold text-gray-900">{c.code}</td>
                <td className="py-3.5 px-5 font-semibold text-[#BE185D]">
                  {c.discountType === 'PERCENTAGE'
                    ? `${c.discountValue}% OFF`
                    : c.discountType === 'FIXED'
                    ? `${formatCurrency(c.discountValue)} OFF`
                    : 'Free Shipping'}
                </td>
                <td className="py-3.5 px-5 font-mono">{formatCurrency(c.minOrderValue)}</td>
                <td className="py-3.5 px-5 font-mono">{c.usageCount} / {c.usageLimit}</td>
                <td className="py-3.5 px-5 text-gray-500">
                  {new Date(c.endDate).toLocaleDateString()}
                </td>
                <td className="py-3.5 px-5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Active
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 text-gray-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-gray-900">Create New Coupon</h3>
            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DROP15"
                  className="w-full border border-gray-200 rounded-xl p-2.5 uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (৳)</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Min Order Value (৳)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E1E1E] text-white rounded-xl font-semibold hover:bg-black"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
