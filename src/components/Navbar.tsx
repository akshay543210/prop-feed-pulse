import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
            PropFirm Tracker
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
              <Button asChild className="bg-gradient-to-r from-primary to-accent rounded-xl">
                <Link to="/submit">Submit Case</Link>
              </Button>
            </motion.div>
          </div>

          <button 
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
            <Button asChild className="w-full">
              <Link to="/submit" onClick={() => setMobileMenuOpen(false)}>
                Submit Case
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
