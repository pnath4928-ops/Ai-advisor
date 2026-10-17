import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  GraduationCap,
  User,
  CalendarCheck,
  ListTodo,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  TrendingUp,
  Bot,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const teacherNav = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/teacher/students", label: "Students", icon: Users },
  {
    path: "/dashboard/teacher/academic-records",
    label: "Records",
    icon: BarChart3,
  },
  {
    path: "/dashboard/teacher/assignments",
    label: "Assignments",
    icon: ClipboardList,
  },
  { path: "/dashboard/teacher/subjects", label: "Subjects", icon: BookOpen },
];

const studentNav = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/student/profile", label: "Profile", icon: User },
  {
    path: "/dashboard/student/study-plans",
    label: "Study Plans",
    icon: CalendarCheck,
  },
  { path: "/dashboard/student/tasks", label: "Tasks", icon: ListTodo },
  {
    path: "/dashboard/student/study-sessions",
    label: "Study Session",
    icon: Play,
  },
  {
    path: "/dashboard/student/assignments",
    label: "Assignments",
    icon: ClipboardList,
  },
  { path: "/dashboard/student/exams", label: "Exams", icon: GraduationCap },
  { path: "/dashboard/student/progress", label: "Progress", icon: TrendingUp },
  { path: "/dashboard/student/ai-advisor", label: "AI Advisor", icon: Bot },
  {
    path: "/dashboard/student/academic-records",
    label: "Records",
    icon: BarChart3,
  },
];

const adminNav = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/admin/users", label: "Users", icon: Users },
  { path: "/dashboard/admin/teachers", label: "Teachers", icon: BookOpen },
  { path: "/dashboard/admin/students", label: "Students", icon: GraduationCap },
];

const sidebarSpring = { type: "spring", stiffness: 400, damping: 38 } as const;

export const Sidebar = ({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const navItems =
    user?.role === "teacher"
      ? teacherNav
      : user?.role === "admin"
        ? adminNav
        : studentNav;

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : "SA";
  const isCollapsed = collapsed && isDesktop;

  return (
    <>
      <AnimatePresence>
        {mobileOpen && !isDesktop && (
          <motion.div
            key="sidebar-overlay"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>
      <motion.aside
        className="fixed left-0 top-0 h-screen z-50 flex flex-col bg-surface/80 backdrop-blur-2xl border-r border-border overflow-hidden"
        animate={{
          width: isDesktop ? (isCollapsed ? 72 : 260) : 260,
          x: isDesktop ? 0 : mobileOpen ? 0 : -260,
        }}
        transition={sidebarSpring}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-16 px-4 border-b border-border ${isCollapsed ? "justify-center" : "gap-3"}`}
        >
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          {!isCollapsed && (
            <motion.span
              className="text-sm font-semibold text-text-primary tracking-wide whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Study Advisor
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center rounded-xl ${
                  isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                } ${isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"}`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <>
                    <motion.span
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-xl bg-primary/15 shadow-[0_0_20px_rgba(124,92,255,0.1)]"
                      transition={sidebarSpring}
                    />
                    <motion.span
                      layoutId="activeNavBar"
                      className="absolute left-0 top-1/2 w-1 h-5 -translate-y-1/2 rounded-r-full bg-success"
                      transition={sidebarSpring}
                    />
                  </>
                )}
                <motion.span
                  className={`relative z-10 flex items-center ${isCollapsed ? "" : "gap-3"}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon
                    className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "text-primary"
                        : "text-text-tertiary group-hover:text-text-secondary"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="hidden lg:block px-3 py-2 border-t border-border">
          <button
            onClick={onToggle}
            className={`flex items-center gap-3 rounded-xl w-full text-text-tertiary hover:text-text-secondary hover:bg-surface-secondary transition-colors duration-200 cursor-pointer ${
              isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-[18px] h-[18px]" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px]" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User Profile */}
        <div
          className={`px-3 py-3 border-t border-border ${isCollapsed ? "flex justify-center" : ""}`}
        >
          <div
            className={`flex items-center gap-3 rounded-xl p-2 hover:bg-surface-secondary transition-colors duration-200 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary">
                {initials}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">
                  {user?.name}
                </p>
                <p className="text-[10px] text-text-tertiary truncate">
                  {user?.email}
                </p>
                <p className="text-[10px] text-text-tertiary capitalize">
                  {user?.role}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <motion.button
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-subtle transition-colors cursor-pointer"
                title="Logout"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};
