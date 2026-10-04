import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Copy, 
  Trash2, 
  Clock, 
  Check, 
  X, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { db } from '../../services/db';
import { useStore } from '../../context/StoreContext';
import { Product, ProductStatus, ProductVariant } from '../../types';

export const AdminProducts: React.FC = () => {
  const { formatCurrency, categories } = useStore();
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('Trendy & Bendy');
  const [category, setCategory] = useState(categories[0]?.name || 'Aesthetic Gadgets');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [regularPrice, setRegularPrice] = useState(2500);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [costPrice, setCostPrice] = useState(1200);
  const [status, setStatus] = useState<ProductStatus>('IN_STOCK');
  const [stockQuantity, setStockQuantity] = useState(20);
  const [imageUrl, setImageUrl] = useState('');
  const [isPreorder, setIsPreorder] = useState(false);
  const [advancePercentage, setAdvancePercentage] = useState(60);
  const [closingDate, setClosingDate] = useState('2026-10-30');
  const [deliveryMinDays, setDeliveryMinDays] = useState(35);
  const [deliveryMaxDays, setDeliveryMaxDays] = useState(45);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Variant input
  const [newVarName, setNewVarName] = useState('');
  const [newVarColor, setNewVarColor] = useState('#FCE7F3');

  const refresh = () => setProducts(db.getProducts());

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setSku(`TB-DROP-${Math.floor(100 + Math.random() * 900)}`);
    setBrand('Trendy & Bendy');
    setCategory(categories[0]?.name || 'Aesthetic Gadgets');
    setShortDesc('');
    setDesc('');
    setRegularPrice(2500);
    setSalePrice(undefined);
    setCostPrice(1200);
    setStatus('IN_STOCK');
    setStockQuantity(20);
    setImageUrl('/src/assets/images/hero_trendy_showcase_1791153752287.jpg');
    setIsPreorder(false);
    setAdvancePercentage(60);
    setClosingDate('2026-10-30');
    setVariants([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setSku(p.sku);
    setBrand(p.brand);
    setCategory(p.category);
    setShortDesc(p.shortDescription);
    setDesc(p.description);
    setRegularPrice(p.regularPrice);
    setSalePrice(p.salePrice);
    setCostPrice(p.costPrice);
    setStatus(p.status);
    setStockQuantity(p.stockQuantity);
    setImageUrl(p.images[0]?.url || '');
    setIsPreorder(p.status === 'PRE_ORDER' || !!p.preorderSettings?.isPreorder);
    setAdvancePercentage(p.preorderSettings?.advancePercentage ?? 60);
    setClosingDate(p.preorderSettings?.closingDate ? p.preorderSettings.closingDate.slice(0, 10) : '2026-10-30');
    setDeliveryMinDays(p.preorderSettings?.estimatedDeliveryMinDays ?? 35);
    setDeliveryMaxDays(p.preorderSettings?.estimatedDeliveryMaxDays ?? 45);
    setVariants(p.variants || []);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    if (!newVarName.trim()) return;
    const v: ProductVariant = {
      id: `v-${Date.now()}`,
      sku: `${sku}-${newVarName.slice(0, 3).toUpperCase()}`,
      name: newVarName.trim(),
      color: newVarColor,
      priceAdjustment: 0,
      stock: 10,
      isActive: true
    };
    setVariants([...variants, v]);
    setNewVarName('');
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const finalProduct: Product = {
      id: editingId || `prod-${Date.now()}`,
      sku: sku.trim(),
      name: name.trim(),
      slug: effectiveSlug,
      description: desc.trim(),
      shortDescription: shortDesc.trim(),
      brand: brand.trim(),
      category,
      tags: ['aesthetic', category.toLowerCase(), isPreorder ? 'preorder' : 'instock'],
      status: isPreorder ? 'PRE_ORDER' : status,
      productType: isPreorder ? 'PREORDER' : variants.length > 0 ? 'VARIABLE' : 'SIMPLE',
      costPrice,
      regularPrice,
      salePrice: salePrice || undefined,
      currency: 'BDT',
      stockQuantity,
      reservedStock: 0,
      lowStockThreshold: 5,
      images: [{ url: imageUrl.trim() || '/src/assets/images/hero_trendy_showcase_1791153752287.jpg', alt: name, isMain: true }],
      variants,
      preorderSettings: isPreorder
        ? {
            isPreorder: true,
            openingDate: new Date().toISOString(),
            closingDate: `${closingDate}T23:59:59Z`,
            estimatedDeliveryMinDays: deliveryMinDays,
            estimatedDeliveryMaxDays: deliveryMaxDays,
            advancePercentage,
            currentPreorderQuantity: 0,
            preorderStatus: 'OPEN'
          }
        : undefined,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.saveProduct(finalProduct, 'Tanvir (Admin)');
    refresh();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      db.deleteProduct(id, 'Tanvir (Admin)');
      refresh();
    }
  };

  const handleDuplicate = (p: Product) => {
    const copy: Product = {
      ...p,
      id: `prod-${Date.now()}`,
      sku: `${p.sku}-COPY`,
      name: `${p.name} (Copy)`,
      slug: `${p.slug}-copy-${Date.now().toString().slice(-4)}`
    };
    db.saveProduct(copy, 'Tanvir (Admin)');
    refresh();
  };

  const filtered = products.filter(p => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Products Catalog</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Add new drops, manage variants, adjust prices, and toggle in-stock vs pre-order modes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#1E1E1E] hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU or category..."
            className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAF9F6] border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-medium focus:outline-none focus:border-black cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="PRE_ORDER">Pre-Order</option>
            <option value="SOLD_OUT">Sold Out</option>
            <option value="HIDDEN">Hidden</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-gray-600 border-b border-gray-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Product</th>
                <th className="py-3 px-5">SKU</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Type / Status</th>
                <th className="py-3 px-5">Price</th>
                <th className="py-3 px-5">Stock</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const isPre = p.status === 'PRE_ORDER' || p.preorderSettings?.isPreorder;
                const img = p.images[0]?.url;

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img
                            src={img}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            No img
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-gray-900 block truncate max-w-xs">{p.name}</span>
                          <span className="text-[10px] text-gray-500">{p.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 font-mono text-gray-600">{p.sku}</td>
                    <td className="py-3 px-5 text-gray-700">{p.category}</td>
                    <td className="py-3 px-5">
                      {isPre ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#FCE7F3] text-[#831843] text-[10px] font-bold">
                          Pre-Order ({p.preorderSettings?.advancePercentage || 60}%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 font-mono font-bold text-gray-900 tabular-nums">
                      {formatCurrency(p.salePrice ?? p.regularPrice)}
                      {p.salePrice && (
                        <span className="block text-[10px] text-gray-400 line-through">
                          {formatCurrency(p.regularPrice)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 font-mono text-gray-800">
                      {isPre ? (
                        <span className="text-[#BE185D] font-semibold">
                          {p.preorderSettings?.currentPreorderQuantity || 0} reserved
                        </span>
                      ) : (
                        `${p.stockQuantity} units`
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-gray-500 hover:text-black rounded-md hover:bg-gray-100"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 text-gray-500 hover:text-black rounded-md hover:bg-gray-100"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 rounded-md hover:bg-gray-100"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h2 className="text-xl font-serif font-bold text-gray-900">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-black" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="font-bold uppercase tracking-wider text-gray-700">1. Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Retro Portable MP3 Player"
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">SKU *</label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value.toUpperCase())}
                      placeholder="TB-MP3-01"
                      className="w-full border border-gray-200 rounded-xl p-2.5 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="Brief 1-sentence hook for cards"
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Description</label>
                  <textarea
                    rows={4}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Comprehensive description of materials, specifications, and aesthetics"
                    className="w-full border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="font-bold uppercase tracking-wider text-gray-700">2. Pricing & Inventory</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Regular Price (৳) *</label>
                    <input
                      type="number"
                      required
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Sale Price (৳, optional)</label>
                    <input
                      type="number"
                      value={salePrice || ''}
                      onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Discounted price"
                      className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Pre-Order Configuration Toggle */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between p-3.5 bg-[#FAF9F6] border border-gray-200 rounded-2xl">
                  <div>
                    <span className="font-bold text-gray-900 block">Pre-Order Product Mode</span>
                    <span className="text-[11px] text-gray-500">
                      Enable 60% partial advance deposit and batch closing countdown.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPreorder}
                    onChange={(e) => setIsPreorder(e.target.checked)}
                    className="w-4 h-4 accent-[#BE185D] cursor-pointer"
                  />
                </div>

                {isPreorder && (
                  <div className="p-4 bg-[#FDF2F8] border border-[#FBCFE8] rounded-2xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#831843] mb-1">Advance Required (%)</label>
                        <input
                          type="number"
                          value={advancePercentage}
                          onChange={(e) => setAdvancePercentage(Number(e.target.value))}
                          className="w-full border border-[#FBCFE8] bg-white rounded-xl p-2.5 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#831843] mb-1">Batch Closing Date</label>
                        <input
                          type="date"
                          value={closingDate}
                          onChange={(e) => setClosingDate(e.target.value)}
                          className="w-full border border-[#FBCFE8] bg-white rounded-xl p-2.5 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Image URL */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <h3 className="font-bold uppercase tracking-wider text-gray-700">3. Media Asset</h3>
                <label className="block font-semibold text-gray-700">Image Asset Path / URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/src/assets/images/retro_mp3_player_1791153763636.jpg"
                  className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              {/* Variants */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <h3 className="font-bold uppercase tracking-wider text-gray-700">4. Product Variants (Color / Size)</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    placeholder="e.g. Baby Pink, EU 38, Lilac"
                    className="flex-1 border border-gray-200 rounded-xl p-2"
                  />
                  <input
                    type="color"
                    value={newVarColor}
                    onChange={(e) => setNewVarColor(e.target.value)}
                    className="w-10 h-9 p-0.5 border border-gray-200 rounded-xl cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-2 bg-[#1E1E1E] text-white rounded-xl font-semibold"
                  >
                    + Add Variant
                  </button>
                </div>

                {variants.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {variants.map((v) => (
                      <span
                        key={v.id}
                        className="px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200 flex items-center gap-2 text-xs"
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                        <span>{v.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id)}
                          className="text-gray-400 hover:text-black ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#BE185D] hover:bg-[#9D174D] text-white rounded-xl font-semibold shadow-xs"
                >
                  {editingId ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
