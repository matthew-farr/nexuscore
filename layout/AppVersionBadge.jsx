import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../ThemeProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Rocket } from 'lucide-react';

export default function AppVersionBadge() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data: latestPublish } = useQuery({
    queryKey: ['latestAppPublish'],
    queryFn: async () => {
      const publishes = await base44.entities.AppPublish.list('-created_date', 1);
      return publishes[0] || null;
    },
  });

  if (!latestPublish?.version_number) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl cursor-help transition-colors ${
            isDark
              ? 'bg-white/[0.06] border border-white/10 hover:bg-white/[0.10]'
              : 'bg-black/[0.04] border border-black/8 hover:bg-black/[0.08]'
          }`}>
            <div className="flex items-center gap-1">
              <Rocket className="w-3 h-3 flex-shrink-0" style={{ color: isDark ? '#22d3ee' : '#0891b2' }} />
              <span className={`text-[11px] font-mono font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>
                {latestPublish.version_number}
              </span>
            </div>
            <span className={`text-[9px] tracking-wider ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Latest published version
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="text-xs space-y-1">
            <p className="font-semibold">Version {latestPublish.version_number}</p>
            {latestPublish.published_by && (
              <p className="text-white/70">Published by {latestPublish.published_by}</p>
            )}
            {latestPublish.published_date && (
              <p className="text-white/60">{format(new Date(latestPublish.published_date), 'PPpp')}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}