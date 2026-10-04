import React, { useState } from 'react';
import { db } from '../../services/db';
import { Shield, Search } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs] = useState(() => db.getAuditLogs());
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return l.actorName.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.entity.toLowerCase().includes(q) || l.entityId.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Security & Operational Audit Log</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Immutable audit record of all staff operations, status overrides, and payment verifications.
        </p>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF9F6] text-gray-600 border-b border-gray-200 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-5">Timestamp</th>
              <th className="py-3 px-5">Staff Member</th>
              <th className="py-3 px-5">Action</th>
              <th className="py-3 px-5">Entity</th>
              <th className="py-3 px-5">Target ID</th>
              <th className="py-3 px-5">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="py-3 px-5 text-gray-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-5 font-sans font-semibold text-gray-900">
                  {log.actorName}
                </td>
                <td className="py-3 px-5">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-semibold">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-5 font-sans text-gray-700">{log.entity}</td>
                <td className="py-3 px-5 text-gray-900 font-bold">{log.entityId}</td>
                <td className="py-3 px-5 font-sans text-gray-500">
                  {log.oldValue && <span>{log.oldValue} → </span>}
                  <span className="text-gray-900">{log.newValue}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
