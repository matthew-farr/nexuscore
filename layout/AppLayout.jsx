import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileSidebar from "./MobileSidebar";
import BackgroundBlobs from "./BackgroundBlobs";
import BackgroundAmbience from "./BackgroundAmbience";
import Breadcrumbs from "./Breadcrumbs";
import RouteGuard from "./RouteGuard";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Premium dark mode ambience */}
      <BackgroundAmbience />

      {/* Animated background blobs */}
      <BackgroundBlobs />

      <RouteGuard />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block relative" style={{ zIndex: 40 }}>
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content */}
      <div className="lg:ml-[240px] relative" style={{ zIndex: 10 }}>
        <TopBar />
        <Breadcrumbs />
        <main className="min-h-[calc(100vh-56px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}