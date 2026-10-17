import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/Sidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { GlobalSearch } from '@/components/GlobalSearch';
import { Avatar } from '@/components/motion/Avatar';
import { PageTransition } from '@/components/motion/PageTransition';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Menu } from 'lucide-react';

export const DashboardLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const pageTitle = location.pathname === '/dashboard'
    ? 'Dashboard'
    : location.pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Dashboard';

  const contentMargin = isDesktop ? (sidebarCollapsed ? 72 : 260) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <motion.div
        className="will-change-[margin]"
        animate={{ marginLeft: contentMargin }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-surface-secondary transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-text-secondary" />
              </button>
              <h1 className="text-base font-semibold text-text-primary">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <GlobalSearch />

              {/* Notifications */}
              <NotificationBell />

              {/* User */}
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <Avatar name={user?.name || user?.email} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};
