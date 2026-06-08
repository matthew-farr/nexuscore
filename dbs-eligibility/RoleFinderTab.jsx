import { useState, useMemo } from 'react';
import { Search, Loader2, FileSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DisclaimerBanner from './DisclaimerBanner';
import ScenarioCard from './ScenarioCard';

function SkeletonCard() {
  return (
    <div className="rounded-xl p-4 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/3 mb-3" />
      <div className="flex gap-2">
        <div className="h-5 bg-gray-100 dark:bg-white/5 rounded-full w-24" />
        <div className="h-5 bg-gray-100 dark:bg-white/5 rounded-full w-20" />
      </div>
    </div>
  );
}

export default function RoleFinderTab({ scenarios, onSelectScenario, isLoading }) {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');

  const allSectors = useMemo(() => [...new Set(scenarios.map(s => s.sector).filter(Boolean))].sort(), [scenarios]);

  const filtered = useMemo(() => {
    return scenarios.filter(s => {
      const matchSearch = !search || s.role_title?.toLowerCase().includes(search.toLowerCase()) || s.sector?.toLowerCase().includes(search.toLowerCase());
      const matchSector = sector === 'all' || s.sector === sector;
      return matchSearch && matchSector;
    });
  }, [scenarios, search, sector]);

  return (
    <div className="space-y-5">
      <DisclaimerBanner />

      {/* Search + Filter */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/35 pointer-events-none" />
          <Input
            placeholder="Search roles — e.g. Teacher, Care Worker, Driver..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.12] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/35 focus-visible:ring-pink-500"
          />
        </div>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-full sm:w-52 bg-white dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.12] text-gray-900 dark:text-white">
            <SelectValue placeholder="All Sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {allSectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <FileSearch className="w-10 h-10 text-gray-300 dark:text-white/20 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-white/40">No roles matched</p>
          <p className="text-xs text-gray-400 dark:text-white/25 mt-1">Try adjusting your search or sector filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(s => (
            <ScenarioCard key={s.id} scenario={s} onClick={onSelectScenario} />
          ))}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-center text-gray-400 dark:text-white/25">
          {filtered.length} scenario{filtered.length !== 1 ? 's' : ''} shown — click a card to view full guidance
        </p>
      )}
    </div>
  );
}