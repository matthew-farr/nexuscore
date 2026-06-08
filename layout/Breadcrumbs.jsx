import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const ROUTE_LABELS = {
  '/': 'Home',
  '/my-profile': 'My Profile',
  '/admin': 'Admin',
  '/admin/profiles': 'Admin / Profiles',
  '/admin/homepage': 'Admin / Homepage',
  '/operations': 'Operations Hub',
  '/compliance': 'Compliance Hub',
  '/sales': 'Sales Hub',
  '/marketing': 'Marketing Hub',
  '/learning': 'Learning Hub',
  '/innovation': 'Innovation Hub',
  '/knowledge': 'Knowledge Centre',
  '/client-resources': 'Client Resources',
  '/calendar': 'Calendar',
  '/news': 'News',
  '/dbs-tracker': 'DBS Query Tracker',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const pathname = location.pathname;
    const parts = pathname.split('/').filter(Boolean);
    
    const crumbs = [{ path: '/', label: 'Home' }];
    
    let currentPath = '';
    for (const part of parts) {
      currentPath += `/${part}`;
      const label = ROUTE_LABELS[currentPath] || part.replace(/-/g, ' ').charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      if (currentPath !== '/') {
        crumbs.push({ path: currentPath, label });
      }
    }
    
    setBreadcrumbs(crumbs);
  }, [location]);

  if (breadcrumbs.length <= 1) return null;

  return (
    <div className="px-4 py-3 text-sm" style={{
      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
    }}>
      <div className="flex items-center gap-2 max-w-[120rem] mx-auto flex-wrap">
        {breadcrumbs.map((crumb, idx) => (
          <div key={crumb.path} className="flex items-center gap-2">
            <Link
              to={crumb.path}
              className="transition-colors flex items-center gap-1"
              style={{
                color: idx === breadcrumbs.length - 1 
                  ? (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)')
                  : (isDark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.70)'),
              }}
            >
              {idx === 0 && <Home className="w-3.5 h-3.5" />}
              <span>{crumb.label}</span>
            </Link>
            {idx < breadcrumbs.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5" style={{
                color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}