import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Clock, Truck, RotateCcw, CreditCard, Shield, FileText } from 'lucide-react';

interface PoliciesPageProps {
  initialTab?: string;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ initialTab = 'preorder' }) => {
  const { settings } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const tabs = [
    { id: 'preorder', label: 'Pre-Order Policy', icon: Clock },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
    { id: 'payment', label: 'Payment Guide', icon: CreditCard },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield }
  ];

  const getPolicyContent = (tabId: string) => {
    switch (tabId) {
      case 'preorder':
        return settings.policies.preorderPolicy;
      case 'shipping':
        return settings.policies.shippingPolicy;
      case 'returns':
        return settings.policies.returnPolicy;
      case 'payment':
        return settings.policies.paymentPolicy;
      case 'terms':
        return settings.policies.termsAndConditions;
      case 'privacy':
        return settings.policies.privacyPolicy;
      default:
        return settings.policies.preorderPolicy;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1E1E1E]">Store Policies & Guides</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Everything you need to know about pre-order slots, advance deposits, courier timelines, and customer protection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition-colors text-left ${
                  isActive
                    ? 'bg-[#1E1E1E] text-white shadow-2xs'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F472B6]' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content View */}
        <main className="md:col-span-3 bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-xs">
          <div className="prose prose-sm max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line space-y-4">
            {getPolicyContent(activeTab)}
          </div>
        </main>
      </div>
    </div>
  );
};
