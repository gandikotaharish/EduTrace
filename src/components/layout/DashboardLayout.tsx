import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Brain, LayoutDashboard, BookOpen, TrendingUp, Users, Settings, LogOut, School, GraduationCap, BarChart3, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSelector } from "@/components/LanguageSelector";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: 'student' | 'teacher' | 'admin';
  userName?: string;
}

const studentNavKeys = [
  { icon: LayoutDashboard, labelKey: 'dashboard', path: '/student' },
  { icon: BookOpen, labelKey: 'learn', path: '/student/learn' },
  { icon: TrendingUp, labelKey: 'progress', path: '/student/progress' },
  { icon: Settings, labelKey: 'settings', path: '/settings' },
];

const teacherNavKeys = [
  { icon: LayoutDashboard, labelKey: 'dashboard', path: '/teacher' },
  { icon: School, labelKey: 'myClasses', path: '/teacher/classes' },
  { icon: Users, labelKey: 'students', path: '/teacher/students' },
  { icon: BookOpen, labelKey: 'concepts', path: '/teacher/concepts' },
  { icon: TrendingUp, labelKey: 'analytics', path: '/teacher/analytics' },
  { icon: Settings, labelKey: 'settings', path: '/settings' },
];

const adminNavKeys = [
  { icon: LayoutDashboard, labelKey: 'dashboard', path: '/admin' },
  { icon: School, labelKey: 'schools', path: '/admin/schools' },
  { icon: Users, labelKey: 'teachers', path: '/admin/teachers' },
  { icon: GraduationCap, labelKey: 'students', path: '/admin/students' },
  { icon: BookOpen, labelKey: 'subjects', path: '/admin/subjects' },
  { icon: Settings, labelKey: 'settings', path: '/settings' },
];

export function DashboardLayout({ children, userRole: propRole, userName: propName }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userRole: authRole, userName: authName, signOut } = useAuth();
  
  const userRole = propRole || authRole || 'student';
  const userName = propName || authName || 'User';
  const navItems = (userRole === 'admin' ? adminNavKeys : userRole === 'teacher' ? teacherNavKeys : studentNavKeys).map(
    (item) => ({ ...item, label: t(item.labelKey) })
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-info flex items-center justify-center">
              <Brain className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">{t('appName')}</span>
          </Link>
        </div>

        {/* Role badge */}
        {userRole === 'admin' && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sidebar-primary/20 text-sidebar-primary text-xs font-semibold">
              <Shield className="w-3 h-3" />
              PLATFORM ADMIN
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sidebar-primary to-info flex items-center justify-center text-sidebar-primary-foreground font-semibold text-sm">
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground truncate">{userName}</div>
              <div className="text-xs text-sidebar-foreground/60 capitalize">{userRole}</div>
            </div>
            <LanguageSelector />
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start mt-2 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('signOut')}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
