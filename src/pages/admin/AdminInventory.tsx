import React, { useState } from 'react';
import { Package, ArrowUpRight, ArrowDownRight, RefreshCw, Plus, Minus, AlertCircle } from 'lucide-react';
import { db } from '../../services/db';
import { Product, InventoryMovementType } from '../../types';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<InventoryMovementType>('STOCK_IN');
  const [adjustQty, setAdjustQty] = useState(5);
  const [adjustReason, setAdjustReason] = useState('New batch arrived from supplier');

  const refresh = () => setProducts(db.getProducts());

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalProduct || adjustQty <= 0) return;

    const previousStock = adjustModalProduct.stockQuantity;
    const delta = adjustType === 'STOCK_IN' || adjustType === 'RETURN' ? adjustQty : -adjustQty;
    const newStock = Math.max(0, previousStock + delta);

    adjustModalProduct.stockQuantity = newStock;
    db.saveProduct(adjustModalProduct, 'Tanvir (Inventory Manager)');
    db.addAuditLog('Tanvir (Inventory Manager)', 'INVENTORY_ADJUST', 'Product', adjustModalProduct.id, `${previousStock}`, `${newStock}`);

    refresh();
    setAdjustModalProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Inventory & Stock Movements</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time physical stock levels at Banani Dhaka warehouse and reserved allocation counters.
          </p>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF9F6] text-gray-600 border-b border-gray-200 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-5">Product</th>
              <th className="py-3 px-5">SKU</th>
              <th className="py-3 px-5">Type</th>
              <th className="py-3 px-5">Physical Stock</th>
              <th className="py-3 px-5">Reserved for Pre-Orders</th>
              <th className="py-3 px-5">Stock Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => {
              const isLow = p.stockQuantity <= p.lowStockThreshold;
              const isPre = p.status === 'PRE_ORDER' || p.preorderSettings?.isPreorder;

              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-5">
                    <span className="font-semibold text-gray-900 block">{p.name}</span>
                    <span className="text-[11px] text-gray-500">{p.category}</span>
                  </td>
                  <td className="py-3 px-5 font-mono text-gray-600">{p.sku}</td>
                  <td className="py-3 px-5">
                    {isPre ? (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#FCE7F3] text-[#831843]">
                        Pre-Order
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-gray-100 text-gray-700">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5 font-mono font-bold text-gray-900 tabular-nums">
                    {p.stockQuantity} units
                  </td>
                  <td className="py-3 px-5 font-mono text-gray-600 tabular-nums">
                    {isPre ? `${p.preorderSettings?.currentPreorderQuantity || 0} reserved` : '—'}
                  </td>
                  <td className="py-3 px-5">
                    {isLow ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        Low Stock (≤{p.lowStockThreshold})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={() => setAdjustModalProduct(p)}
                      className="text-xs font-semibold text-[#BE185D] hover:underline"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setAdjustModalProduct(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-gray-900">
              Adjust Stock: {adjustModalProduct.name}
            </h3>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                >
                  <option value="STOCK_IN">Stock In (Restock / Incoming parcel)</option>
                  <option value="STOCK_OUT">Stock Out (Manual sale / deduction)</option>
                  <option value="DAMAGE">Damaged / Defective write-off</option>
                  <option value="RETURN">Customer Return back to shelf</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quantity Units</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received 10 units at Banani hub"
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalProduct(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E1E1E] text-white rounded-xl font-semibold hover:bg-black"
                >
                  Record Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
