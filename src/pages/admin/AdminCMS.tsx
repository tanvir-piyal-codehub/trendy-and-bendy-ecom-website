import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { db } from '../../services/db';
import { Check } from 'lucide-react';

export const AdminCMS: React.FC = () => {
  const { settings, refreshStore } = useStore();

  // Announcement Bar state
  const [announcementText, setAnnouncementText] = useState(settings.announcementBar.text);
  const [announcementEnabled, setAnnouncementEnabled] = useState(settings.announcementBar.enabled);

  // Hero state
  const [heroHeading, setHeroHeading] = useState(settings.heroBanner.heading);
  const [heroSubheading, setHeroSubheading] = useState(settings.heroBanner.subheading);
  const [heroBtnText, setHeroBtnText] = useState(settings.heroBanner.buttonText);
  const [heroBtnUrl, setHeroBtnUrl] = useState(settings.heroBanner.buttonUrl);
  const [heroBg, setHeroBg] = useState(settings.heroBanner.backgroundImage);

  const [saved, setSaved] = useState(false);

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings({
      announcementBar: {
        ...settings.announcementBar,
        text: announcementText,
        enabled: announcementEnabled
      },
      heroBanner: {
        ...settings.heroBanner,
        heading: heroHeading,
        subheading: heroSubheading,
        buttonText: heroBtnText,
        buttonUrl: heroBtnUrl,
        backgroundImage: heroBg
      }
    }, 'Tanvir (Content Manager)');

    refreshStore();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">CMS & Homepage Visuals</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Edit your top announcement bar, hero campaigns, and banner copy without touching code.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Homepage content updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveCMS} className="space-y-8">
        {/* Announcement Bar */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-serif font-bold text-gray-900">Announcement Bar</h2>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-4 h-4 accent-black"
              />
              <span className="font-semibold">Enabled</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Banner Announcement Text</label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2.5 text-xs"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-serif font-bold text-gray-900">Hero Section</h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Hero Heading</label>
              <input
                type="text"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5 font-serif text-sm font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Subheading Prose</label>
              <textarea
                rows={2}
                value={heroSubheading}
                onChange={(e) => setHeroSubheading(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Primary Button Text</label>
                <input
                  type="text"
                  value={heroBtnText}
                  onChange={(e) => setHeroBtnText(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Background Image Path</label>
                <input
                  type="text"
                  value={heroBg}
                  onChange={(e) => setHeroBg(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#1E1E1E] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          Publish CMS Changes
        </button>
      </form>
    </div>
  );
};
