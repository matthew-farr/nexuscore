import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  'LPF DETAILS',
  'WITHDRAWN',
  'ESCALATED',
  'DUE TO BE ESCALATED',
  'UNABLE TO ESCALATE ONLINE',
  'CJSM',
  'INTERNAL QUERY - INCONFLICT'
];

const POLICE_OPTIONS = [
  'Police details received',
  'Awaiting police details',
  'Not required',
  'Unable to confirm'
];

export default function DBSEscalationCreateForm({ isDark, onClose, onSuccess, userDisplayName = '' }) {
  const [form, setForm] = useState({
    eref: '',
    dbs_submitted_date: '',
    company: '',
    application_ref: '',
    tracking_code: '',
    escalated_date: '',
    status: 'DUE TO BE ESCALATED',
    police_details: '',
    agent: userDisplayName || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    const trimmedEref = (form.eref || '').trim();
    if (!trimmedEref) {
      setError('ERef is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      console.time('dbs-escalation-duplicate-check');
      // Check for duplicate eref
      const trimmedEref = form.eref.trim().toUpperCase();
      const existing = await base44.entities.DBSEscalation.filter({ eref: trimmedEref }, '', 1);
      console.timeEnd('dbs-escalation-duplicate-check');

      if (existing && existing.length > 0) {
        setError('An escalation already exists for this ERef.');
        setSaving(false);
        return;
      }

      // Prepare form data with trimming and uppercase eref
      const escalatedDate = form.status === 'ESCALATED' && !form.escalated_date 
        ? new Date().toISOString().split('T')[0]
        : form.escalated_date;

      const submitData = {
        eref: trimmedEref,
        dbs_submitted_date: form.dbs_submitted_date || null,
        company: (form.company || '').trim() || null,
        application_ref: (form.application_ref || '').trim() || null,
        tracking_code: (form.tracking_code || '').trim() || null,
        escalated_date: escalatedDate || null,
        status: form.status,
        police_details: form.police_details || '',
        agent: (form.agent || '').trim() || null
      };

      console.time('dbs-escalation-create-save');
      await base44.entities.DBSEscalation.create(submitData);
      console.timeEnd('dbs-escalation-create-save');

      toast.success('Escalation created successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create escalation:', err);
      setError(err.message || 'Failed to save escalation');
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0"
        style={{ zIndex: 1000 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl overflow-hidden"
          style={{
            background: isDark ? '#1a1a2e' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <div className="flex items-center justify-between">
              <h2 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-lg font-semibold">
                Create Escalation
              </h2>
              <button onClick={onClose} className="p-1 hover:bg-accent rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* ERef - Required */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                ERef <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.eref}
                onChange={(e) => setForm({ ...form, eref: e.target.value })}
                placeholder="Enter ERef"
                className="text-sm"
                autoFocus
              />
            </div>

            {/* DBS Submitted Date */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                DBS Submitted Date
              </label>
              <Input
                type="date"
                value={form.dbs_submitted_date}
                onChange={(e) => setForm({ ...form, dbs_submitted_date: e.target.value })}
                className="text-sm"
              />
            </div>

            {/* Company */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                Company
              </label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company name"
                className="text-sm"
              />
            </div>

            {/* Application Ref */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                Application Ref
              </label>
              <Input
                value={form.application_ref}
                onChange={(e) => setForm({ ...form, application_ref: e.target.value })}
                placeholder="Application reference"
                className="text-sm"
              />
            </div>

            {/* Tracking Code */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                Tracking Code
              </label>
              <Input
                value={form.tracking_code}
                onChange={(e) => setForm({ ...form, tracking_code: e.target.value })}
                placeholder="Tracking code"
                className="text-sm"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                Status
              </label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Escalated Date */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                Escalated Date
              </label>
              <Input
                type="date"
                value={form.escalated_date}
                onChange={(e) => setForm({ ...form, escalated_date: e.target.value })}
                className="text-sm"
              />
            </div>

            {/* Police Details */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                Police Details
              </label>
              <Select value={form.police_details} onValueChange={(value) => setForm({ ...form, police_details: value })}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {POLICE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agent */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                Agent
              </label>
              <Input
                value={form.agent}
                onChange={(e) => setForm({ ...form, agent: e.target.value })}
                placeholder="Agent name or email"
                className="text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t space-y-3" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)' }}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Creating...' : 'Create Escalation'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}