import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const STAGE_COLORS = {
  'New CJSM': '#06b6d4',
  'Sent to Client': '#f59e0b',
  'Waiting on Client': '#ef4444',
  'Client Responded': '#10b981',
  'Responded to DBS': '#8b5cf6',
  'Further Clarification Required': '#ec2ca3',
  'Resolved / Closed': '#14b8a6',
  'Cancelled': '#6b7280'
};

const getAgeColor = (age) => {
  if (age <= 3) return '#10b981'; // green
  if (age <= 7) return '#f59e0b'; // amber
  return '#ef4444'; // red
};

export default function DBSQueryTable({ records, onView, onEdit, onDelete, isDark, calculateQueryAge }) {
  if (!records.length) {
    return (
      <div className="text-center py-12">
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-sm">
          No DBS queries found. Import data or create a new query to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg" style={{
      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
    }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
            <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-4 py-3 font-semibold">Date</th>
            <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-4 py-3 font-semibold">EREF</th>
            <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-4 py-3 font-semibold">Our Ref</th>
            <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-4 py-3 font-semibold">Company</th>
            <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-4 py-3 font-semibold">Query Type</th>
            <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-4 py-3 font-semibold">Agent</th>
            <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-4 py-3 font-semibold">Stage</th>
            <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-4 py-3 font-semibold">Age</th>
            <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <motion.tr
              key={record.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => onView(record)}
              className="cursor-pointer hover:opacity-75 transition-opacity"
              style={{
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)',
                background: isDark ? 'rgba(255,255,255,0.005)' : 'rgba(0,0,0,0.005)'
              }}
            >
              <td className="px-4 py-3">
                {record.date_received ? new Date(record.date_received).toLocaleDateString() : '-'}
              </td>
              <td className="px-4 py-3 font-semibold">{record.eref}</td>
              <td className="px-4 py-3">{record.our_ref}</td>
              <td className="px-4 py-3" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                {record.company_name}
              </td>
              <td className="px-4 py-3" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                {record.query_type || '-'}
              </td>
              <td className="px-4 py-3 text-xs">{record.agent_assigned || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: STAGE_COLORS[record.stage] || '#06b6d4' }}
                  />
                  <span className="text-xs font-semibold">{record.stage}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-semibold" style={{ color: getAgeColor(calculateQueryAge(record.date_received)) }}>
                  {calculateQueryAge(record.date_received)} days
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); onEdit(record); }}
                    className="h-7 px-2"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete this query?')) onDelete(record.id); }}
                    className="h-7 px-2"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}