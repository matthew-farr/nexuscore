import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ThemeProvider } from './components/ThemeProvider';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import PlaceholderPage from './pages/PlaceholderPage';
import MyProfile from './pages/MyProfile';
import OperationsHub from './pages/OperationsHub';
import SalesHub from './pages/SalesHub';
import MarketingHub from './pages/MarketingHub';
import LearningHub from './pages/LearningHub';
import InnovationHub from './pages/InnovationHub.jsx';
import ManagementHub from './pages/ManagementHub';
import KnowledgeBase from './pages/KnowledgeBase.jsx';
import AdminHub from './pages/AdminHub';
import Calendar from './pages/Calendar';
import News from './pages/News';
import DBSQueryTracker from './pages/DBSQueryTracker';
import DBSEscalationTracker from './pages/DBSEscalationTracker';
import OperationsIssueLog from './pages/OperationsIssueLog';
import DBSEligibilityGuide from './pages/DBSEligibilityGuide';
import SupplierRegister from './pages/SupplierRegister';
import JiraIssuesView from './pages/JiraIssuesView';
import FeatureReleases from './pages/FeatureReleases';
import JiraDiagnostics from './pages/JiraDiagnostics';
import PublicDocumentShare from './pages/PublicDocumentShare';
import HubSpotTickets from './pages/HubSpotTickets';
import PowerBIDaxTester from './pages/PowerBIDaxTester.jsx';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background mesh-gradient">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-glow-pink to-glow-purple flex items-center justify-center animate-pulse">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/my-work" element={<PlaceholderPage />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/admin/profiles" element={<AdminHub />} />
        <Route path="/admin/homepage" element={<AdminHub />} />
        <Route path="/operations" element={<OperationsHub />} />
        <Route path="/sales" element={<SalesHub />} />
        <Route path="/marketing" element={<MarketingHub />} />
        <Route path="/learning" element={<LearningHub />} />
        <Route path="/innovation" element={<InnovationHub />} />
        <Route path="/management" element={<ManagementHub />} />
        <Route path="/news" element={<PlaceholderPage />} />
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/news" element={<News />} />

        <Route path="/templates" element={<PlaceholderPage />} />
        <Route path="/people" element={<PlaceholderPage />} />
        <Route path="/dbs-tracker" element={<DBSQueryTracker />} />
        <Route path="/operations/60-day-dbs-escalations" element={<DBSEscalationTracker />} />
        <Route path="/operations/issue-log" element={<OperationsIssueLog />} />
        <Route path="/operations/dbs-eligibility-guide" element={<DBSEligibilityGuide />} />
        <Route path="/operations/supplier-register" element={<SupplierRegister />} />
        <Route path="/jira-issues" element={<JiraIssuesView />} />
        <Route path="/feature-releases" element={<FeatureReleases />} />
        <Route path="/jira-diagnostics" element={<JiraDiagnostics />} />
        <Route path="/hubspot-tickets" element={<HubSpotTickets />} />
        <Route path="/powerbi-dax-tester" element={<PowerBIDaxTester />} />
        <Route path="/admin" element={<AdminHub />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <Routes>
              {/* Public route — no auth required */}
              <Route path="/share/doc" element={<PublicDocumentShare />} />
              {/* All other routes require auth */}
              <Route path="/*" element={<AuthenticatedApp />} />
            </Routes>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App