import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../ThemeProvider';
import { Calendar, Clock } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

export default function UserLoginHistory({ userId }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data: logins = [], isLoading } = useQuery({
    queryKey: ['userLogins', userId],
    queryFn: () =>
      userId ? base44.entities.UserLoginLog.filter({ user_id: userId }, '-login_at', 100) : [],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? 'border-white/20 border-t-white/50' : 'border-slate-200 border-t-slate-600'}`} />
      </div>
    );
  }

  if (logins.length === 0) {
    return (
      <div className={`py-8 text-center text-sm ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
        No login history
      </div>
    );
  }

  const lastLogin = logins[0];

  return (
    <div className="space-y-4">
      {/* Last login summary */}
      <div className={`p-4 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
        <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-white/50' : 'text-slate-600'}`}>LAST LOGIN</p>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatInTimeZone(new Date(lastLogin.login_at), 'Europe/London', 'd MMMM yyyy, HH:mm')}
          </p>
        </div>
      </div>

      {/* Login history table */}
      <div>
        <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-white/50' : 'text-slate-600'}`}>LOGIN HISTORY ({logins.length})</p>
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'border-b border-white/10 bg-white/[0.02]' : 'border-b border-slate-200 bg-slate-50'}>
                  <th className={`px-4 py-2 text-left font-semibold text-xs ${isDark ? 'text-white/50' : 'text-slate-600'}`}>Date</th>
                  <th className={`px-4 py-2 text-left font-semibold text-xs ${isDark ? 'text-white/50' : 'text-slate-600'}`}>Time</th>
                </tr>
              </thead>
              <tbody>
                {logins.map((log, i) => {
                  const date = new Date(log.login_at);
                  return (
                    <tr
                      key={log.id || i}
                      className={`border-b last:border-b-0 ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-100 hover:bg-slate-50'}`}
                    >
                      <td className={`px-4 py-2.5 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
                        {formatInTimeZone(date, 'Europe/London', 'd MMM yyyy')}
                      </td>
                      <td className={`px-4 py-2.5 font-mono text-xs ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                        {formatInTimeZone(date, 'Europe/London', 'HH:mm:ss')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}