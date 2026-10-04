import * as React from "react";
import { Outlet } from "react-router-dom";
import { Header, Sidebar, Footer, MobileNav } from "../components/layout";

export const DashboardLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    return localStorage.getItem("nilev_sidebar_collapsed") === "true";
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);
  const [isServerConnecting, setIsServerConnecting] = React.useState(false);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleConnecting = () => {
      setIsServerConnecting(true);
      clearTimeout(timer);
      timer = setTimeout(() => setIsServerConnecting(false), 45000);
    };
    const handleReady = () => {
      setIsServerConnecting(false);
      clearTimeout(timer);
    };

    window.addEventListener("nilev:server:connecting", handleConnecting);
    window.addEventListener("nilev:server:ready", handleReady);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("nilev:server:connecting", handleConnecting);
      window.removeEventListener("nilev:server:ready", handleReady);
    };
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("nilev_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="relative flex min-h-screen bg-[#070913] text-slate-100 selection:bg-violet-600/30 selection:text-violet-200">
      {/* Background Cosmic Atmosphere Lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[20%] left-[10%] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute top-[40%] -right-[10%] h-[500px] w-[500px] rounded-full bg-indigo-600/08 blur-[160px]" />
        <div className="absolute -bottom-[10%] left-[30%] h-[550px] w-[550px] rounded-full bg-pink-600/06 blur-[150px]" />
      </div>

      {/* Sidebar (Desktop / Tablet / Mobile Drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        isMobileOpen={isMobileDrawerOpen}
        onMobileClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header onMobileMenuToggle={() => setIsMobileDrawerOpen(true)} />

        {isServerConnecting && (
          <div className="sticky top-14 sm:top-16 z-30 flex items-center justify-center gap-2 border-b border-violet-500/30 bg-gradient-to-r from-violet-950/95 via-indigo-950/95 to-purple-950/95 py-2 px-4 text-center text-xs font-medium text-violet-200 backdrop-blur-xl animate-in slide-in-from-top duration-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            <span>Sanctuary server is waking up... Please hold on a moment.</span>
          </div>
        )}

        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-12 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>

        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenDrawer={() => setIsMobileDrawerOpen(true)} />
    </div>
  );
};
