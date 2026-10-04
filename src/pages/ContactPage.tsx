import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { db } from '../services/db';

export const ContactPage: React.FC = () => {
  const { settings } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    db.saveContactMessage({
      name,
      email,
      phone,
      orderNumber,
      subject: subject || 'General Inquiry',
      message
    });

    setSubmitted(true);
    setName('');
    setEmail('');
    setPhone('');
    setOrderNumber('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1E1E1E]">
          Contact & Customer Care
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Have an inquiry about a pre-order drop or delivery? We're here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-serif font-bold text-[#1E1E1E]">
              Get in Touch
            </h2>

            <div className="space-y-4 text-xs text-gray-700">
              <div className="flex items-start gap-3">
                <Instagram className="w-4 h-4 text-[#BE185D] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Instagram Direct Message</span>
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#BE185D] hover:underline"
                  >
                    @trendy_.and_.bendy
                  </a>
                  <p className="text-[11px] text-gray-500">Fastest response for quick order inquiries.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">WhatsApp & Hotline</span>
                  <span className="text-gray-900 font-mono">{settings.contactPhone}</span>
                  <p className="text-[11px] text-gray-500">Daily: 11:00 AM – 9:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Email Support</span>
                  <span className="text-gray-900">{settings.contactEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Sorting Hub & Showroom</span>
                  <span className="text-gray-900">{settings.address}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FDF2F8] border border-[#FBCFE8] rounded-2xl text-xs text-[#831843]">
              <strong>Pre-Order Note:</strong> For inquiries regarding batch delivery dates, please include your Order ID (e.g. TB-2026-000101) for faster assistance.
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-serif font-bold text-[#1E1E1E] mb-6">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-semibold text-emerald-900">Message Received!</h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  Thank you for reaching out. Our customer care team has received your message and will respond within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Your Name <span className="text-[#E11D48]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ayesha Siddiqua"
                      className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
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
                      placeholder="ayesha@gmail.com"
                      className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01712-345678"
                      className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Order Reference # (If applicable)
                    </label>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. TB-2026-000101"
                      className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 uppercase font-mono focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Inquiring about heels size / batch arrival"
                    className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Message <span className="text-[#E11D48]">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we assist you?"
                    className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1E1E1E] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
