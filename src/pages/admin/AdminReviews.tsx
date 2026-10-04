import React, { useState } from 'react';
import { db } from '../../services/db';
import { Review } from '../../types';
import { Check, X, Star } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(() => db.getReviews());

  const handleUpdateStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    db.updateReviewStatus(id, status, 'Tanvir (Admin)');
    setReviews(db.getReviews());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Product Reviews Moderation</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Verify and moderate customer reviews before they appear on product pages.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF9F6] text-gray-600 border-b border-gray-200 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-5">Product</th>
              <th className="py-3 px-5">Customer</th>
              <th className="py-3 px-5">Rating</th>
              <th className="py-3 px-5">Review Comment</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="py-3.5 px-5 font-semibold text-gray-900">{r.productName}</td>
                <td className="py-3.5 px-5">
                  <span className="font-semibold block text-gray-900">{r.customerName}</span>
                  <span className="text-[11px] text-gray-500">{r.customerEmail}</span>
                </td>
                <td className="py-3.5 px-5">
                  <div className="flex text-amber-500 text-xs">
                    {'★'.repeat(r.rating)}
                  </div>
                </td>
                <td className="py-3.5 px-5 max-w-sm text-gray-700 italic">
                  "{r.comment}"
                </td>
                <td className="py-3.5 px-5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {r.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    )}
                    {r.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-[11px] font-semibold hover:bg-rose-100 hover:text-rose-800"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
