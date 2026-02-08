import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, LayoutDashboard, BookOpen, TrendingUp, Users, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: 'student' | 'teacher' | 'admin';
  userName?: string;
}

const studentNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/student' },
  { icon: BookOpen, label: 'Learn', path: '/student/learn' },
  { icon: TrendingUp, label: 'Progress', path: '/student/progress' },
];

const teacherNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher' },
  { icon: Users, label: 'Students', path: '/teacher/students' },
  { icon: BookOpen, label: 'Concepts', path: '/teacher/concepts' },
  { icon: TrendingUp, label: 'Analytics', path: '/teacher/analytics' },
];

export function DashboardLayout({ children, userRole: propRole, userName: propName }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole: authRole, userName: authName, signOut } = useAuth();
  
  const userRole = propRole || authRole || 'student';
  const userName = propName || authName || 'User';
  const navItems = userRole === 'student' ? studentNavItems : teacherNavItems;

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
            <span className="text-xl font-bold text-sidebar-foreground">EduTrace</span>
          </Link>
        </div>

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
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start mt-2 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
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
