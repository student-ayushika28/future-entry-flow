import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { VisitorProvider } from "@/contexts/VisitorContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AddVisitor from "./pages/AddVisitor";
import VisitorList from "./pages/VisitorList";
import FaceRecognition from "./pages/FaceRecognition";
import QRCheckIn from "./pages/QRCheckIn";
import VisitorForm from "./pages/VisitorForm";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTPVerification from "./pages/OTPVerification";
import AuditLogs from "./pages/AuditLogs";
import Watchlist from "./pages/Watchlist";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen gradient-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const mfaVerified = sessionStorage.getItem("mfa_verified") === "true";
  if (!mfaVerified) return <Navigate to="/verify" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen gradient-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/verify" element={isAuthenticated ? <OTPVerification /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/add-visitor" element={<ProtectedRoute><AddVisitor /></ProtectedRoute>} />
      <Route path="/visitors" element={<ProtectedRoute><VisitorList /></ProtectedRoute>} />
      <Route path="/face-recognition" element={<ProtectedRoute><FaceRecognition /></ProtectedRoute>} />
      <Route path="/qr-checkin" element={<ProtectedRoute><QRCheckIn /></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
      <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
      <Route path="/visitor-form" element={<VisitorForm />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <VisitorProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </VisitorProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
