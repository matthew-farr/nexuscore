import { useState } from 'react';
import { LayoutDashboard, BookOpen, ClipboardList, Award, Tag, BarChart3, Settings } from 'lucide-react';
import LmsDashboard from './LmsDashboard';
import LmsCoursesTab from './LmsCoursesTab';
import LmsAssignmentsTab from './LmsAssignmentsTab';
import LmsCertificatesTab from './LmsCertificatesTab';
import LmsCategoriesTab from './LmsCategoriesTab';
import LmsReportingTab from './LmsReportingTab';
import LmsSettingsTab from './LmsSettingsTab';

const NAV = [
  { key: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { key: 'courses',      label: 'Courses',       icon: BookOpen },
  { key: 'assignments',  label: 'Assignments',   icon: ClipboardList },
  { key: 'certificates', label: 'Certificates',  icon: Award },
  { key: 'categories',   label: 'Categories',    icon: Tag },
  { key: 'reporting',    label: 'Reporting',     icon: BarChart3 },
  { key: 'settings',     label: 'Settings',      icon: Settings },
];

export default function LearningManagementPanel() {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Sidebar nav */}
      <div className="w-48 flex-shrink-0">
        <div className="rounded-2xl p-3 sticky top-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest px-2 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Learning Management</p>
          <nav className="space-y-0.5">
            {NAV.map(item => {
              const Icon = item.icon;
              const active = activeSection === item.key;
              return (
                <button key={item.key} onClick={() => setActiveSection(item.key)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left"
                  style={{
                    background: active ? 'rgba(139,92,246,0.15)' : 'transparent',
                    color: active ? '#c4b5fd' : 'rgba(255,255,255,0.40)',
                    border: active ? '1px solid rgba(139,92,246,0.25)' : '1px solid transparent',
                  }}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {activeSection === 'dashboard'    && <LmsDashboard />}
        {activeSection === 'courses'      && <LmsCoursesTab />}
        {activeSection === 'assignments'  && <LmsAssignmentsTab />}
        {activeSection === 'certificates' && <LmsCertificatesTab />}
        {activeSection === 'categories'   && <LmsCategoriesTab />}
        {activeSection === 'reporting'    && <LmsReportingTab />}
        {activeSection === 'settings'     && <LmsSettingsTab />}
      </div>
    </div>
  );
}