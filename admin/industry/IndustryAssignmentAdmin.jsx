import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Archive, ArchiveRestore, Trash2, X, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const OWNERS = ['Sam', 'Claire', 'Sandra'];
const STATUS_OPTIONS = ['Active', 'Archived'];

function IndustryModal({ record, onClose, onSave }) {
  const [form, setForm] = useState({
    industry_name: record?.industry_name || '',
    owner: record?.owner || 'Sam',
    status: record?.status || 'Active',
    notes: record?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!form.industry_name.trim()) return;
    setSaving(true);
    const payload = { ...form, updated_by: user?.email || '' };
    if (record?.id) {
      await base44.entities.IndustryAssignment.update(record.id, payload);
    } else {
      await base44.entities.IndustryAssignment.create(payload);
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base">{record?.id ? 'Edit Industry' : 'Add Industry'}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Industry Name *</label>
            <Input
              value={form.industry_name}
              onChange={e => setForm(f => ({ ...f, industry_name: e.target.value }))}
              placeholder="e.g. Healthcare"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Owner *</label>
            <Select value={form.owner} onValueChange={v => setForm(f => ({ ...f, owner: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OWNERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <Input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes..."
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.industry_name.trim()} className="flex-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {record?.id ? 'Save Changes' : 'Add Industry'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function IndustryAssignmentAdmin() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterOwner, setFilterOwner] = useState('__all__');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [modal, setModal] = useState(null); // null | record (or {})
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.IndustryAssignment.list('industry_name', 500);
    setRecords(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return records.filter(r => {
      if (filterOwner !== '__all__' && r.owner !== filterOwner) return false;
      if (filterStatus !== '__all__' && r.status !== filterStatus) return false;
      if (search.trim() && !r.industry_name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [records, filterOwner, filterStatus, search]);

  const handleArchiveToggle = async (record) => {
    const newStatus = record.status === 'Active' ? 'Archived' : 'Active';
    await base44.entities.IndustryAssignment.update(record.id, { status: newStatus, updated_by: user?.email || '' });
    toast.success(`${record.industry_name} ${newStatus === 'Archived' ? 'archived' : 'restored'}`);
    load();
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete "${record.industry_name}"? This cannot be undone.`)) return;
    await base44.entities.IndustryAssignment.delete(record.id);
    toast.success('Industry deleted');
    load();
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await base44.functions.invoke('seedIndustryAssignments', {});
      toast.success(`Seeded: ${res.data?.created ?? 0} created, ${res.data?.skipped ?? 0} skipped`);
      load();
    } catch {
      toast.error('Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-semibold">Industry Assignment Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{records.filter(r => r.status === 'Active').length} active industries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Seed Defaults
          </Button>
          <Button size="sm" onClick={() => setModal({})}>
            <Plus className="w-4 h-4" /> Add Industry
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search industry..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 w-56"
        />
        <Select value={filterOwner} onValueChange={setFilterOwner}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Owners</SelectItem>
            {OWNERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left font-semibold p-3 text-muted-foreground">Industry</th>
                <th className="text-left font-semibold p-3 text-muted-foreground">Owner</th>
                <th className="text-left font-semibold p-3 text-muted-foreground">Status</th>
                <th className="text-left font-semibold p-3 text-muted-foreground hidden md:table-cell">Last Updated</th>
                <th className="text-left font-semibold p-3 text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground">No industries found</td>
                </tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-medium">{r.industry_name}</td>
                  <td className="p-3 text-muted-foreground">{r.owner}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'Active' ? 'bg-green-500/15 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell text-xs">
                    {r.updated_date ? format(new Date(r.updated_date), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setModal(r)} title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleArchiveToggle(r)} title={r.status === 'Active' ? 'Archive' : 'Restore'}>
                        {r.status === 'Active' ? <Archive className="w-3.5 h-3.5" /> : <ArchiveRestore className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(r)} title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <IndustryModal
          record={modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}