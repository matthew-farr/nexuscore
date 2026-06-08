import { Info } from 'lucide-react';

const SETTING_GROUPS = [
  {
    title: 'Certificates',
    settings: [
      { label: 'Default Certificate Name', desc: 'Template used when generating certificates', type: 'text', placeholder: 'Certificate of Completion' },
      { label: 'Certificate Validity (months)', desc: 'How long certificates remain valid (0 = no expiry)', type: 'number', placeholder: '12' },
    ],
  },
  {
    title: 'Completion Rules',
    settings: [
      { label: 'Minimum Score to Pass', desc: 'Minimum quiz score required to complete (if applicable)', type: 'number', placeholder: '80' },
      { label: 'Require All Modules', desc: 'Users must complete every module to pass a course', type: 'toggle', default: true },
    ],
  },
  {
    title: 'Reminders',
    settings: [
      { label: 'Due Date Reminder (days before)', desc: 'Send reminder this many days before due date', type: 'number', placeholder: '7' },
      { label: 'Overdue Reminder Frequency', desc: 'How often to nudge overdue learners', type: 'select', opts: ['Daily', 'Weekly', 'Fortnightly', 'Never'] },
    ],
  },
  {
    title: 'Manager Permissions',
    settings: [
      { label: 'Managers can assign training', desc: 'Allow managers to assign courses to their team', type: 'toggle', default: true },
      { label: 'Managers can view reports', desc: 'Allow managers to see team completion reports', type: 'toggle', default: true },
      { label: 'Managers can create courses', desc: 'Allow managers to create and edit courses (not recommended)', type: 'toggle', default: false },
    ],
  },
];

export default function LmsSettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-white">Settings</h2>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>LMS configuration and defaults</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}>
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#60a5fa' }} />
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>
          Full settings persistence is coming soon. These settings show the intended configuration options for the LMS. Current defaults are applied automatically.
        </p>
      </div>

      {SETTING_GROUPS.map(group => (
        <div key={group.title} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-xs font-bold text-white mb-4">{group.title}</h3>
          <div className="space-y-4">
            {group.settings.map(s => (
              <div key={s.label} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-white/80">{s.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.desc}</p>
                </div>
                <div className="flex-shrink-0">
                  {s.type === 'toggle' ? (
                    <div className="w-10 h-5 rounded-full relative cursor-not-allowed opacity-60"
                      style={{ background: s.default ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.12)' }}>
                      <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
                        style={{ left: s.default ? '22px' : '2px' }} />
                    </div>
                  ) : s.type === 'select' ? (
                    <select disabled className="px-3 h-8 rounded-lg text-xs text-white/60 outline-none opacity-60"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                      {s.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={s.type} placeholder={s.placeholder} disabled
                      className="w-28 px-3 h-8 rounded-lg text-xs text-white/60 outline-none opacity-60"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}