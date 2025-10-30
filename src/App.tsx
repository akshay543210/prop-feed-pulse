import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Approvals from "./pages/Approvals";
import Denials from "./pages/Denials";
import Firms from "./pages/Firms";
import FirmDetail from "./pages/FirmDetail";
import SubmitCase from "./pages/SubmitCase";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFirms from "./pages/admin/Firms";
import AdminCases from "./pages/admin/Cases";
import AdminUsers from "./pages/admin/Users";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminLogs from "./pages/admin/Logs";
import AdminSettings from "./pages/admin/Settings";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/denials" element={<Denials />} />
          <Route path="/firms" element={<Firms />} />
          <Route path="/firms/:id" element={<FirmDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/submit" element={<ProtectedRoute requireAuth><SubmitCase /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/firms" element={<ProtectedRoute><AdminFirms /></ProtectedRoute>} />
          <Route path="/admin/cases" element={<ProtectedRoute><AdminCases /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute><AdminLogs /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
