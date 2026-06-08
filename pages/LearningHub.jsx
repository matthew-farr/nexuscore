import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { LayoutDashboard, BookOpen, Layers, Award, Users2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

import TrainingHero from '../components/training/TrainingHero';
import TrainingKPIs from '../components/training/TrainingKPIs';
import OverviewTab from '../components/training/OverviewTab';
import MyTrainingTab from '../components/training/MyTrainingTab';
import CourseLibraryTab from '../components/training/CourseLibraryTab';
import CertificatesTab from '../components/training/CertificatesTab';
import ManagerTab from '../components/training/ManagerTab';
import CourseViewer from '../components/training/CourseViewer';
import { SEED_COURSES, SEED_CHECKLIST_ITEMS, isOverdue, getEffectiveStatus } from '../components/training/trainingConfig';

const TABS = [
  { key: 'overview',    label: 'Overview',      icon: LayoutDashboard },
  { key: 'my-training', label: 'My Training',   icon: BookOpen },
  { key: 'library',     label: 'Course Library', icon: Layers },
  { key: 'certs',       label: 'Certificates',  icon: Award },
  { key: 'manager',     label: 'Manager View',  icon: Users2 },
];

export default function LearningHub() {
  useActivityTracking({ entity_type: "hub", entity_id: "learning", title: "Learning Hub", route: "/learning", icon: "GraduationCap" });

  const [activeTab, setActiveTab] = useState('overview');
  const [openCourse, setOpenCourse] = useState(null);
  const [openAssignment, setOpenAssignment] = useState(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [myTrainingFilter, setMyTrainingFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: coursesRaw = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['trainingCourses'],
    queryFn: () => base44.entities.TrainingCourse.list('-created_date', 100),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['trainingAssignments', user?.id],
    queryFn: () => user ? base44.entities.TrainingAssignment.filter({ user_id: user.id }) : [],
    enabled: !!user,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['trainingCertificates', user?.id],
    queryFn: () => user ? base44.entities.TrainingCertificate.filter({ user_id: user.id }) : [],
    enabled: !!user,
  });

  // Seed courses + checklist items on first visit if empty
  useEffect(() => {
    if (!coursesLoading && coursesRaw.length === 0) {
      Promise.all(SEED_COURSES.map(c => base44.entities.TrainingCourse.create(c)))
        .then(created => {
          queryClient.invalidateQueries({ queryKey: ['trainingCourses'] });
          // Seed checklist items for the "New Starter Checklist" course
          const checklistCourse = created.find(c => c.title === 'New Starter Checklist');
          if (checklistCourse) {
            Promise.all(SEED_CHECKLIST_ITEMS.map(item =>
              base44.entities.TrainingChecklistItem.create({ ...item, course_id: checklistCourse.id })
            ));
          }
        });
    }
  }, [coursesRaw.length, coursesLoading]);

  // Use seed data as placeholder while seeding
  const courses = coursesRaw.length > 0 ? coursesRaw : SEED_COURSES.map((c, i) => ({ ...c, id: `seed-${i}` }));

  // KPI stats
  const stats = useMemo(() => ({
    assigned:   assignments.length,
    inProgress: assignments.filter(a => a.status === 'in_progress').length,
    completed:  assignments.filter(a => a.status === 'completed').length,
    overdue:    assignments.filter(a => getEffectiveStatus(a) === 'overdue').length,
    certs:      certificates.length,
  }), [assignments, certificates]);

  // Best "continue" course: in_progress first, then oldest not_started
  const continueAssignment = useMemo(() =>
    assignments.find(a => a.status === 'in_progress') ||
    assignments.filter(a => a.status === 'not_started').sort((a, b) => new Date(a.due_date || '9999') - new Date(b.due_date || '9999'))[0],
    [assignments]);
  const continueCourse = continueAssignment ? courses.find(c => c.id === continueAssignment.course_id) : null;

  const handleOpen = (course, assignment) => {
    setOpenCourse(course);
    setOpenAssignment(assignment || assignments.find(a => a.course_id === course.id) || null);
  };

  const handleSearch = (q) => {
    setLibrarySearch(q);
    setActiveTab('library');
  };

  const handleCompleted = () => {
    queryClient.invalidateQueries({ queryKey: ['trainingAssignments'] });
    queryClient.invalidateQueries({ queryKey: ['trainingCertificates'] });
  };

  const handleKpiClick = (key) => {
    if (key === 'certs') {
      setActiveTab('certs');
    } else {
      const filterMap = {
        assigned: 'all',
        inProgress: 'in_progress',
        completed: 'completed',
        overdue: 'overdue',
      };
      setMyTrainingFilter(filterMap[key] || 'all');
      setActiveTab('my-training');
      setLibrarySearch('');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#080b18' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        <TrainingHero
          user={user}
          continueCourse={continueCourse}
          continueAssignment={continueAssignment}
          onOpen={handleOpen}
          onSearch={handleSearch}
        />

        <TrainingKPIs stats={stats} onKpiClick={handleKpiClick} />

        {/* Admin shortcut — visible to admins only */}
        {['admin', 'super_admin'].includes(user?.role) && (
          <div className="flex justify-end mb-3">
            <Link to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#c4b5fd' }}>
              <Settings className="w-3 h-3" />
              Manage Learning
            </Link>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-0 overflow-x-auto mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex-shrink-0"
                style={{
                  borderBottomColor: isActive ? '#8b5cf6' : 'transparent',
                  color: isActive ? '#c4b5fd' : 'rgba(255,255,255,0.40)',
                  background: isActive ? 'rgba(139,92,246,0.06)' : 'transparent',
                  marginBottom: '-1px',
                }}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            {activeTab === 'overview' && (
              <OverviewTab
                courses={courses} assignments={assignments} certificates={certificates}
                user={user} onOpen={handleOpen} onTabChange={setActiveTab}
              />
            )}
            {activeTab === 'my-training' && (
              <MyTrainingTab courses={courses} assignments={assignments} onOpen={handleOpen} initialFilter={myTrainingFilter} />
            )}
            {activeTab === 'library' && (
              <CourseLibraryTab courses={courses} assignments={assignments} onOpen={handleOpen} initialSearch={librarySearch} user={user} />
            )}
            {activeTab === 'certs' && (
              <CertificatesTab certificates={certificates} courses={courses} user={user} />
            )}
            {activeTab === 'manager' && (
              <ManagerTab user={user} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Course viewer */}
      <AnimatePresence>
        {openCourse && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setOpenCourse(null)} />
            <CourseViewer
              course={openCourse}
              assignment={openAssignment}
              user={user}
              onClose={() => setOpenCourse(null)}
              onCompleted={handleCompleted}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}