import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tag, Plus } from 'lucide-react';
import { CATEGORIES as DEFAULT_CATS } from './lmsConfig';

// Categories are derived from actual courses — we show live usage counts
// Admins can see which categories are in use and how many courses belong to each

export default function LmsCategoriesTab() {
  const { data: courses = [] } = useQuery({ queryKey: ['lms-courses'], queryFn: () => base44.entities.TrainingCourse.list('-created_date', 300) });

  // Build category stats from live course data, supplemented with defaults
  const allCategories = [...new Set([...DEFAULT_CATS, ...courses.map(c => c.category).filter(Boolean)])];
  const catStats = allCategories.map(cat => {
    const catCourses = courses.filter(c => c.category === cat);
    return {
      name: cat,
      total: catCourses.length,
      published: catCourses.filter(c => c.status === 'published').length,
      draft: catCourses.filter(c => c.status === 'draft').length,
      archived: catCourses.filter(c => c.status === 'archived').length,
    };
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-white">Categories</h2>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
          {allCategories.length} categories — manage courses within each category from the Courses tab
        </p>
      </div>

      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)', color: 'rgba(255,255,255,0.50)' }}>
        Categories are defined at the course level. To add a new category, create a course and enter a new category name. To archive a category, archive or reassign all its courses.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {catStats.map(cat => (
          <div key={cat.name} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <Tag className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
              </div>
              <p className="text-xs font-bold text-white">{cat.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{cat.total}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Total</p>
              </div>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="flex gap-3 text-[10px]">
                <span style={{ color: '#10b981' }}>{cat.published} live</span>
                <span style={{ color: '#f59e0b' }}>{cat.draft} draft</span>
                <span style={{ color: '#6b7280' }}>{cat.archived} archived</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}