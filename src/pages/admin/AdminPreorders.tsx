import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  Users, 
  Download, 
  Edit3, 
  Check, 
  AlertCircle,
  Truck,
  Sparkles
} from 'lucide-react';
import { db } from '../../services/db';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const AdminPreorders: React.FC = () => {
  const { formatCurrency } = useStore();
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const orders = db.getOrders();

  const preorderProducts = products.filter(p => p.status === 'PRE_ORDER' || p.preorderSettings?.isPreorder);
  const preorderOrders = orders.filter(o => o.hasPreorderItems);

  // Financial aggregates
  const totalPreorderRevenue = preorderOrders.reduce((sum, o) => sum + o.advancePaid, 0);
  const totalPreorderOutstanding = preorderOrders.reduce((sum, o) => sum + o.remainingBalance, 0);

  // Edit batch modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [closingDate, setClosingDate] = useState('');
  const [advancePct, setAdvancePct] = useState(60);
  const [deliveryMin, setDeliveryMin] = useState(35);
  const [deliveryMax, setDeliveryMax] = useState(45);
  const [batchStatus, setBatchStatus] = useState<'OPEN' | 'CLOSED' | 'EXTENDED' | 'FULFILLED'>('OPEN');
  const [modalSuccess, setModalSuccess] = useState('');

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setClosingDate(p.preorderSettings?.closingDate ? p.preorderSettings.closingDate.slice(0, 10) : '2026-10-25');
    setAdvancePct(p.preorderSettings?.advancePercentage ?? 60);
    setDeliveryMin(p.preorderSettings?.estimatedDeliveryMinDays ?? 35);
    setDeliveryMax(p.preorderSettings?.estimatedDeliveryMaxDays ?? 45);
    setBatchStatus(p.preorderSettings?.preorderStatus ?? 'OPEN');
  };

  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated: Product = {
      ...editingProduct,
      preorderSettings: {
        isPreorder: true,
        openingDate: editingProduct.preorderSettings?.openingDate || new Date().toISOString(),
        closingDate: `${closingDate}T23:59:59Z`,
        estimatedDeliveryMinDays: deliveryMin,
        estimatedDeliveryMaxDays: deliveryMax,
        advancePercentage: advancePct,
        currentPreorderQuantity: editingProduct.preorderSettings?.currentPreorderQuantity || 0,
        preorderStatus: batchStatus
      }
    };

    db.saveProduct(updated, 'Tanvir (Pre-order Manager)');
    setProducts(db.getProducts());
    setModalSuccess('Batch configuration updated!');
    setTimeout(() => {
      setModalSuccess('');
      setEditingProduct(null);
    }, 1500);
  };

  const handleExportPreorderManifest = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'District', 'Items', 'Advance Paid', 'Remaining Balance Due', 'Status'];
    const rows = preorderOrders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      o.shippingAddress.district,
      `"${o.items.map(i => `${i.productName} (${i.quantity})`).join('; ')}"`,
      o.advancePaid,
      o.remainingBalance,
      o.orderStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trendy_bendy_preorder_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            Pre-Order Command Center
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage advance-deposit batches, monitor closing deadlines, and track factory import allocations.
          </p>
        </div>

        <button
          onClick={handleExportPreorderManifest}
          className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-gray-500" />
          <span>Export Pre-Order Manifest ({preorderOrders.length})</span>
        </button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-[#FDF2F8] border border-[#FBCFE8] rounded-3xl space-y-1">
          <span className="text-xs uppercase font-bold text-[#831843] tracking-wide block">
            Collected Advance (Cash in Hand)
          </span>
          <span className="text-3xl font-mono font-bold text-[#BE185D] tabular-nums block">
            {formatCurrency(totalPreorderRevenue)}
          </span>
          <p className="text-[11px] text-[#9D174D]">Deposited to fund manufacturing & import</p>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-3xl space-y-1 shadow-xs">
          <span className="text-xs uppercase font-bold text-gray-500 tracking-wide block">
            Outstanding Balance to Collect
          </span>
          <span className="text-3xl font-mono font-bold text-gray-900 tabular-nums block">
            {formatCurrency(totalPreorderOutstanding)}
          </span>
          <p className="text-[11px] text-gray-500">Collectable upon parcel doorstep delivery in Dhaka</p>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-3xl space-y-1 shadow-xs">
          <span className="text-xs uppercase font-bold text-gray-500 tracking-wide block">
            Total Reserved Pre-Order Slots
          </span>
          <span className="text-3xl font-mono font-bold text-gray-900 tabular-nums block">
            {preorderOrders.reduce((sum, o) => sum + o.items.reduce((acc, i) => acc + i.quantity, 0), 0)}
          </span>
          <p className="text-[11px] text-gray-500">Active drop reservations</p>
        </div>
      </div>

      {/* Active Pre-Order Drops Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-base font-serif font-bold text-gray-900">
            Active Pre-Order Products & Deadlines
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {preorderProducts.map((p) => {
            const isClosingSoon = true;
            const settings = p.preorderSettings;

            return (
              <div key={p.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  {p.images[0]?.url && (
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">{p.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FCE7F3] text-[#831843] font-bold">
                        {settings?.advancePercentage || 60}% Advance
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                      <span>Price: <strong>{formatCurrency(p.salePrice ?? p.regularPrice)}</strong></span>
                      <span>·</span>
                      <span>Reserved: <strong className="font-mono">{settings?.currentPreorderQuantity || 0} units</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[#BE185D] font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        Closes: {new Date(settings?.closingDate || '2026-10-25').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-gray-400" />
                      <span>Estimated delivery: {settings?.estimatedDeliveryMinDays || 35}–{settings?.estimatedDeliveryMaxDays || 45} days after batch close</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-3.5 py-2 bg-white border border-gray-200 hover:border-black rounded-xl text-xs font-semibold text-gray-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                    <span>Configure Batch</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Batch Configuration Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setEditingProduct(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-gray-900">
              Configure Pre-Order Batch: {editingProduct.name}
            </h3>

            {modalSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium text-center">
                ✓ {modalSuccess}
              </div>
            ) : (
              <form onSubmit={handleSaveBatch} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Batch Closing Date <span className="text-[#E11D48]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Customer orders will lock automatically when this deadline passes.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Advance Required (%)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={advancePct}
                      onChange={(e) => setAdvancePct(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Batch Status
                    </label>
                    <select
                      value={batchStatus}
                      onChange={(e) => setBatchStatus(e.target.value as any)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    >
                      <option value="OPEN">Open (Accepting Orders)</option>
                      <option value="EXTENDED">Extended</option>
                      <option value="CLOSED">Closed (Factory Processing)</option>
                      <option value="FULFILLED">Fulfilled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Min Delivery Days (e.g. 35)
                    </label>
                    <input
                      type="number"
                      value={deliveryMin}
                      onChange={(e) => setDeliveryMin(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Max Delivery Days (e.g. 45)
                    </label>
                    <input
                      type="number"
                      value={deliveryMax}
                      onChange={(e) => setDeliveryMax(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1E1E1E] text-white rounded-xl font-semibold hover:bg-black"
                  >
                    Save Batch Settings
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
