import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { POLICE_FORCE_OPTIONS } from '@/lib/dbsEscalationImportUtils';

const STATUS_OPTIONS = [
  'LPF DETAILS',
  'WITHDRAWN',
  'ESCALATED',
  'DUE TO BE ESCALATED',
  'UNABLE TO ESCALATE ONLINE',
  'CJSM',
  'INTERNAL QUERY - INCONFLICT'
];


export default function DBSEscalationDrawer({ isOpen, onClose, onSuccess, isDark, userDisplayName = '' }) {
  const [form, setForm] = useState({
    eref: '',
    dbs_submitted_date: '',
    company: '',
    application_ref: '',
    escalated_date: '',
    status: 'DUE TO BE ESCALATED',
    police_details: '__blank__',
    account_manager: userDisplayName || '',
    escalated_agent: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setForm({
        eref: '',
        dbs_submitted_date: '',
        company: '',
        application_ref: '',
        escalated_date: '',
        status: 'DUE TO BE ESCALATED',
        police_details: '__blank__',
        account_manager: userDisplayName || '',
        escalated_agent: ''
      });
      setError('');
    }
  }, [isOpen, userDisplayName]);

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
      const trimmedEref = form.eref.trim().toUpperCase();
      const existing = await base44.entities.DBSEscalation.filter({ eref: trimmedEref }, '', 1);
      console.timeEnd('dbs-escalation-duplicate-check');

      if (existing && existing.length > 0) {
        setError('An escalation already exists for this ERef.');
        setSaving(false);
        return;
      }

      const escalatedDate = form.status === 'ESCALATED' && !form.escalated_date
        ? new Date().toISOString().split('T')[0]
        : form.escalated_date;

      const submitData = {
        eref: trimmedEref,
        dbs_submitted_date: form.dbs_submitted_date || null,
        company: (form.company || '').trim() || null,
        application_ref: (form.application_ref || '').trim() || null,
        escalated_date: escalatedDate || null,
        status: form.status,
        police_details: form.police_details === '__blank__' ? '' : form.police_details,
        account_manager: (form.account_manager || '').trim() || null,
        escalated_agent: (form.escalated_agent || '').trim() || null
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

  const canSave = (form.eref || '').trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 520 }}
            animate={{ x: 0 }}
            exit={{ x: 520 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-[520px] z-50 overflow-y-auto flex flex-col"
            style={{
              background: isDark ? '#1a1a2e' : '#ffffff',
              borderLeft: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
            }}
          >
            {/* Header */}
            <div className="sticky top-0 p-6 border-b flex items-center justify-between" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-xl font-semibold">
                Create DBS Escalation
              </h2>
              <button onClick={onClose} className="p-1 hover:bg-accent rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Section A: Applicant Details */}
              <div className="space-y-4">
                <h3 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-sm font-semibold">
                  A. Applicant Details
                </h3>
                
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
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

                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Company
                  </label>
                  <Input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Company name"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Application Ref
                  </label>
                  <Input
                    value={form.application_ref}
                    onChange={(e) => setForm({ ...form, application_ref: e.target.value })}
                    placeholder="Application reference"
                    className="text-sm"
                  />
                </div>

              </div>

              {/* Section B: DBS Details */}
              <div className="space-y-4">
                <h3 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-sm font-semibold">
                  B. DBS Details
                </h3>

                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    DBS Submitted Date
                  </label>
                  <Input
                    type="date"
                    value={form.dbs_submitted_date}
                    onChange={(e) => setForm({ ...form, dbs_submitted_date: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Status
                  </label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Local Police Force
                  </label>
                  <Select value={form.police_details || '__blank__'} onValueChange={(value) => setForm({ ...form, police_details: value === '__blank__' ? '' : value })}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select police force" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__blank__">— None —</SelectItem>
                      {POLICE_FORCE_OPTIONS.map((force) => (
                        <SelectItem key={force} value={force}>{force}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                   <label className="text-xs font-medium mb-2 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                     Escalated Date
                   </label>
                   <Input
                     type="date"
                     value={form.escalated_date}
                     onChange={(e) => {
                       const newDate = e.target.value;
                       setForm(prev => ({
                         ...prev,
                         escalated_date: newDate,
                         // Auto-fill escalated_agent with current user when date is entered
                         escalated_agent: newDate && !prev.escalated_agent ? userDisplayName : prev.escalated_agent
                       }));
                     }}
                     className="text-sm"
                   />
                 </div>
              </div>

              {/* Section C: Ownership */}
              <div className="space-y-4">
                <h3 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-sm font-semibold">
                  C. Ownership
                </h3>

                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Account Manager
                  </label>
                  <Input
                    value={form.account_manager}
                    onChange={(e) => setForm({ ...form, account_manager: e.target.value })}
                    placeholder="Account manager name or email"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Escalated Agent
                  </label>
                  <Input
                    value={form.escalated_agent}
                    onChange={(e) => setForm({ ...form, escalated_agent: e.target.value })}
                    placeholder="Escalated agent name or email"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-6 border-t space-y-3" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <Button
                onClick={handleSave}
                disabled={saving || !canSave}
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
        </>
      )}
    </AnimatePresence>
  );
}