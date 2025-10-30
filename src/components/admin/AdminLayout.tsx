import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  BarChart3,
  ScrollText,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Building2, label: 'Firms', path: '/admin/firms' },
  { icon: FileText, label: 'Cases', path: '/admin/cases' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: ScrollText, label: 'Logs', path: '/admin/logs' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-screen w-64 glass-strong border-r border-border z-50"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold gradient-text-primary">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">PayoutCases</p>
        </div>

        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-3 right-3">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="h-16 glass-strong border-b border-border flex items-center px-6 sticky top-0 z-40">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
