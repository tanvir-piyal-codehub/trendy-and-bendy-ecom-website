import React, { useState } from 'react';
import { Users, Search, Tag, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { db } from '../../services/db';
import { useStore } from '../../context/StoreContext';
import { Customer } from '../../types';

export const AdminCustomers: React.FC = () => {
  const { formatCurrency } = useStore();
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Customer CRM & Audience</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          View customer lifetime value, outstanding pre-order balances, and purchase behavior.
        </p>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF9F6] text-gray-600 border-b border-gray-200 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-5">Customer</th>
              <th className="py-3 px-5">Contact</th>
              <th className="py-3 px-5">Total Orders</th>
              <th className="py-3 px-5">Lifetime Spent</th>
              <th className="py-3 px-5">Outstanding Balance</th>
              <th className="py-3 px-5">Tags</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3.5 px-5">
                  <span className="font-semibold text-gray-900 block">{c.name}</span>
                  <span className="text-[11px] text-gray-500">
                    Joined {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="py-3.5 px-5">
                  <span className="font-mono text-gray-800 block">{c.phone}</span>
                  <span className="text-[11px] text-gray-500">{c.email}</span>
                </td>
                <td className="py-3.5 px-5 font-mono font-semibold text-gray-900 tabular-nums">
                  {c.totalOrders}
                </td>
                <td className="py-3.5 px-5 font-mono font-bold text-gray-900 tabular-nums">
                  {formatCurrency(c.totalSpent)}
                </td>
                <td className="py-3.5 px-5 font-mono tabular-nums">
                  {c.outstandingBalance > 0 ? (
                    <span className="font-bold text-[#BE185D]">{formatCurrency(c.outstandingBalance)}</span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">৳0</span>
                  )}
                </td>
                <td className="py-3.5 px-5">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="text-xs font-semibold text-[#BE185D] hover:underline"
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedCustomer(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <h3 className="text-lg font-serif font-bold text-gray-900">
              Customer Profile: {selectedCustomer.name}
            </h3>

            <div className="space-y-3 p-4 bg-[#FAF9F6] border border-gray-200 rounded-2xl">
              <div>
                <span className="text-gray-500 block uppercase font-semibold text-[10px]">Contact</span>
                <span className="text-gray-900 font-medium block">{selectedCustomer.email}</span>
                <span className="text-gray-900 font-mono block">{selectedCustomer.phone}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase font-semibold text-[10px]">Saved Delivery Address</span>
                <span className="text-gray-800 block">
                  {selectedCustomer.address
                    ? `${selectedCustomer.address.addressLine}, ${selectedCustomer.address.city}`
                    : 'No default address stored'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span>Total Orders: <strong className="font-mono">{selectedCustomer.totalOrders}</strong></span>
                <span>Lifetime: <strong className="font-mono">{formatCurrency(selectedCustomer.totalSpent)}</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-[#1E1E1E] text-white rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
