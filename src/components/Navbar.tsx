import { Link } from "react-router-dom";
import { Home, CheckCircle, XCircle, Building2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-success flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">PropFirm Tracker</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/approvals" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="hidden sm:inline">Approvals</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/denials" className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="hidden sm:inline">Denials</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/firms" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Firms</span>
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-primary to-success">
            <Link to="/submit" className="flex items-center space-x-2">
              <PlusCircle className="w-4 h-4" />
              <span>Submit Case</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
