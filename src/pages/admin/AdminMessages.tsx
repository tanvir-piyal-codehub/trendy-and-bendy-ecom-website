import React, { useState } from 'react';
import { db } from '../../services/db';
import { ContactMessage } from '../../types';
import { Mail, Phone, MessageSquare, Send } from 'lucide-react';

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>(() => db.getContactMessages());
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (id: string) => {
    if (!replyText.trim()) return;
    db.replyContactMessage(id, replyText, 'Tanvir (Customer Support)');
    setMessages(db.getContactMessages());
    setReplyId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Customer Inquiries & Messages</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Inbox for questions regarding batch status, pre-orders, and product advice.
        </p>
      </div>

      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">{m.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 font-semibold text-gray-700">
                  {m.status}
                </span>
                {m.orderNumber && (
                  <span className="font-mono text-xs text-[#BE185D] font-bold">
                    Order: {m.orderNumber}
                  </span>
                )}
              </div>
              <span className="text-gray-400 text-[11px]">
                {new Date(m.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="text-gray-500 flex flex-wrap gap-4 text-[11px]">
              <span>Email: <strong className="text-gray-800">{m.email}</strong></span>
              {m.phone && <span>Phone: <strong className="text-gray-800 font-mono">{m.phone}</strong></span>}
              <span>Subject: <strong className="text-gray-800">{m.subject}</strong></span>
            </div>

            <p className="text-gray-800 bg-[#FAF9F6] p-3 rounded-xl border border-gray-100 leading-relaxed">
              "{m.message}"
            </p>

            {m.adminReply && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                <span className="font-bold block text-[11px]">Staff Reply:</span>
                <p>{m.adminReply}</p>
              </div>
            )}

            {!m.adminReply && (
              <div>
                {replyId === m.id ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response to the customer..."
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-black"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReplyId(null)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReplySubmit(m.id)}
                        className="px-3 py-1.5 bg-[#1E1E1E] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Send Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyId(m.id)}
                    className="text-xs text-[#BE185D] hover:underline font-semibold"
                  >
                    Reply to Customer
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
