import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '@/lib/AuthContext';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { TABS } from '../components/knowledge/kbConfig';
import KBHero from '../components/knowledge/KBHero';
import KBDocumentList from '../components/knowledge/KBDocumentList';
import KBDocumentDrawer from '../components/knowledge/KBDocumentDrawer';
import KBDocumentForm from '../components/knowledge/KBDocumentForm';
import KBRecentPanel from '../components/knowledge/KBRecentPanel';
import { toast } from 'sonner';

export default function KnowledgeBase() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useActivityTracking({ entity_type: 'hub', entity_id: 'knowledge', title: 'Knowledge Base', route: '/knowledge', icon: 'BookOpen' });

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDoc, setOpenDoc] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  const openEditForm = (doc) => { setEditingDoc(doc); setFormOpen(true); };
  const handleDocSaved = () => queryClient.invalidateQueries({ queryKey: ['knowledgeDocs'] });
  const handleArchived = () => queryClient.invalidateQueries({ queryKey: ['knowledgeDocs'] });

  // Fetch documents
  const { data: allDocs = [], isLoading } = useQuery({
    queryKey: ['knowledgeDocs'],
    queryFn: () => base44.entities.KnowledgeDocument.list('-updated_date', 500),
  });

  // Fetch bookmarks
  const { data: bookmarks = [] } = useQuery({
    queryKey: ['kbBookmarks', user?.id],
    queryFn: () => base44.entities.KnowledgeBookmark.filter({ user_id: user.id }),
    enabled: !!user?.id,
  });

  const bookmarkedIds = useMemo(() => new Set(bookmarks.map(b => b.document_id)), [bookmarks]);

  const addBookmarkMutation = useMutation({
    mutationFn: (doc) => base44.entities.KnowledgeBookmark.create({ user_id: user.id, document_id: doc.id, document_title: doc.title }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['kbBookmarks', user?.id] }); toast.success('Saved to My Saved'); },
  });
  const removeBookmarkMutation = useMutation({
    mutationFn: (docId) => {
      const bookmark = bookmarks.find(b => b.document_id === docId);
      if (bookmark) return base44.entities.KnowledgeBookmark.delete(bookmark.id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['kbBookmarks', user?.id] }); toast.success('Removed from My Saved'); },
  });
  const handleToggleBookmark = (doc) => {
    if (bookmarkedIds.has(doc.id)) removeBookmarkMutation.mutate(doc.id);
    else addBookmarkMutation.mutate(doc);
  };

  // Tab filtering
  const tabDocs = useMemo(() => {
    const tab = TABS.find(t => t.key === activeTab);
    if (!tab) return [];

    let docs = allDocs.filter(d => {
      if (d.status === 'Archived') return false;
      if (d.status === 'Published') return true;
      return isAdmin;
    });

    if (tab.key === 'saved') {
      return allDocs.filter(d => bookmarkedIds.has(d.id));
    }
    if (tab.key === 'links') {
      docs = docs.filter(d => d.audience?.includes('links_resources') || d.doc_type === 'External Link');
    } else if (tab.key === 'templates') {
      docs = docs.filter(d => d.audience?.includes('templates_forms') || ['Template', 'Form'].includes(d.doc_type));
    } else if (tab.audience) {
      docs = docs.filter(d => d.audience?.includes(tab.audience));
    }

    return docs;
  }, [allDocs, activeTab, bookmarkedIds, isAdmin]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-background' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className={`text-sm ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Loading Knowledge Base…</p>
        </div>
      </div>
    );
  }

  const publishedDocs = allDocs.filter(d => d.status === 'Published');

  return (
    <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-slate-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Hero with search */}
        <KBHero
          onAskAI={() => toast.info('AI assistant coming soon!')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isAdmin={isAdmin}
          onAdd={() => { setEditingDoc(null); setFormOpen(true); }}
        />

        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedCategory(null); }}
              className="px-3.5 h-8 rounded-lg text-xs font-semibold transition-all"
              style={activeTab === tab.key ? {
                background: 'linear-gradient(135deg, #7c3aed, #ec2ca3)',
                color: 'white',
                boxShadow: '0 2px 12px rgba(124,58,237,0.30)',
              } : {
                background: isDark ? 'rgba(255,255,255,0.06)' : 'white',
                color: isDark ? 'rgba(255,255,255,0.65)' : '#374151',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#d1d5db'}`,
                boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.07)',
                fontWeight: '500',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main content — document list + recent panel side by side on desktop */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* Document list */}
          <div className="flex-1 min-w-0 rounded-2xl p-5"
            style={{
              background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#d1d5db'}`,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.07)',
            }}>
            <KBDocumentList
              documents={tabDocs}
              bookmarkedIds={bookmarkedIds}
              onOpen={setOpenDoc}
              onToggleBookmark={handleToggleBookmark}
              categoryFilter={selectedCategory}
              onClearCategory={() => setSelectedCategory(null)}
              externalSearch={searchQuery}
            />
          </div>

          {/* Recent panel — right side on desktop, hidden on mobile (shown below) */}
          <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <KBRecentPanel documents={publishedDocs} onOpen={setOpenDoc} />
          </div>

          {/* Recent panel — stacked below on mobile */}
          <div className="block lg:hidden w-full">
            <KBRecentPanel documents={publishedDocs} onOpen={setOpenDoc} />
          </div>
        </div>

      </div>

      {/* Add/Edit Form */}
      <KBDocumentForm
        doc={editingDoc}
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingDoc(null); }}
        onSaved={handleDocSaved}
      />

      {/* Document Drawer */}
      <KBDocumentDrawer
        doc={openDoc}
        isOpen={!!openDoc}
        onClose={() => setOpenDoc(null)}
        isBookmarked={openDoc ? bookmarkedIds.has(openDoc.id) : false}
        onToggleBookmark={handleToggleBookmark}
        isAdmin={isAdmin}
        onEdit={openEditForm}
        onArchived={handleArchived}
      />
    </div>
  );
}