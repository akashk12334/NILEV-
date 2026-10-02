import * as React from "react";
import { Outlet } from "react-router-dom";
import { Header, Sidebar, Footer, MobileNav } from "../components/layout";

export const DashboardLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    return localStorage.getItem("nilev_sidebar_collapsed") === "true";
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);

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
