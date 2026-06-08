import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageContainer from '@/components/ui-custom/PageContainer';
import AdminQuickLinksManager from '@/components/admin/AdminQuickLinksManager';
import AdminHubsManager from '@/components/admin/AdminHubsManager';
import AdminWidgetsManager from '@/components/admin/AdminWidgetsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';

export default function AdminHomepage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/';
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <PageContainer>
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-destructive font-medium">Admin access required</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Homepage Management</h1>
          <p className="text-muted-foreground mt-1">Configure quick links, hubs, and widgets displayed on the homepage</p>
        </div>

        <Tabs defaultValue="quick-links" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="quick-links">Quick Links</TabsTrigger>
            <TabsTrigger value="hubs">Hubs</TabsTrigger>
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
          </TabsList>

          <TabsContent value="quick-links" className="mt-6">
            <AdminQuickLinksManager />
          </TabsContent>

          <TabsContent value="hubs" className="mt-6">
            <AdminHubsManager />
          </TabsContent>

          <TabsContent value="widgets" className="mt-6">
            <AdminWidgetsManager />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}