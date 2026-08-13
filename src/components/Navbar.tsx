import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Bell, UserCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import SubmitCaseButton from "@/components/SubmitCaseButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 w-full z-50 glass-strong border-b border-border/50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold gradient-text-primary hover:scale-105 transition-transform">
            Payout Cases
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`relative transition-colors text-sm font-medium ${
                isActive('/') ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              Home
              {isActive('/') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </Link>
            <Link 
              to="/firms" 
              className={`relative transition-colors text-sm font-medium ${
                isActive('/firms') ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              Firms
              {isActive('/firms') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </Link>
            <Link 
              to="/approvals" 
              className={`relative transition-colors text-sm font-medium ${
                isActive('/approvals') ? 'text-success' : 'text-foreground hover:text-success'
              }`}
            >
              Approvals
              {isActive('/approvals') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-success"
                />
              )}
            </Link>
            <Link 
              to="/denials" 
              className={`relative transition-colors text-sm font-medium ${
                isActive('/denials') ? 'text-destructive' : 'text-foreground hover:text-destructive'
              }`}
            >
              Denials
              {isActive('/denials') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-destructive"
                />
              )}
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <SubmitCaseButton className="bg-gradient-to-r from-primary to-accent rounded-xl">
                Submit Case
              </SubmitCaseButton>
            </motion.div>
            {user ? (
              <>
                <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
                  <Link to="/notifications"><Bell className="h-5 w-5" /></Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open account menu">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card">
                    <DropdownMenuItem onClick={() => navigate('/notifications')}>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/me')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild className="bg-gradient-to-r from-primary to-accent rounded-xl">
                  <Link to="/auth">Login / Sign Up</Link>
                </Button>
              </motion.div>
            )}
          </div>

          <button
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 space-y-4"
          >
            <Link 
              to="/" 
              className="block py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/firms" 
              className="block py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Firms
            </Link>
            <Link 
              to="/approvals" 
              className="block py-2 text-sm font-medium text-success"
              onClick={() => setMobileMenuOpen(false)}
            >
              Approvals
            </Link>
            <Link 
              to="/denials" 
              className="block py-2 text-sm font-medium text-destructive"
              onClick={() => setMobileMenuOpen(false)}
            >
              Denials
            </Link>
            <SubmitCaseButton className="w-full">Submit Case</SubmitCaseButton>
            {user ? (
              <>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/notifications" onClick={() => setMobileMenuOpen(false)}>
                    Notifications
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button asChild className="w-full">
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  Login / Sign Up
                </Link>
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
