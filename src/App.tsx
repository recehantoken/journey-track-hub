
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import VehiclesPage from "./pages/VehiclesPage";
import DriversPage from "./pages/DriversPage";
import RentalsPage from "./pages/RentalsPage";
import TrackingPage from "./pages/TrackingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Show loading or redirect if not authenticated
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

// Public routes (accessible when not logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Show loading or redirect if already authenticated
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/" />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<MainLayout><PublicRoute><LoginPage /></PublicRoute></MainLayout>} />
      <Route path="/register" element={<MainLayout><PublicRoute><RegisterPage /></PublicRoute></MainLayout>} />
      
      {/* Protected routes */}
      <Route path="/" element={<MainLayout><ProtectedRoute><Index /></ProtectedRoute></MainLayout>} />
      <Route path="/vehicles" element={<MainLayout><ProtectedRoute><VehiclesPage /></ProtectedRoute></MainLayout>} />
      <Route path="/drivers" element={<MainLayout><ProtectedRoute><DriversPage /></ProtectedRoute></MainLayout>} />
      <Route path="/rentals" element={<MainLayout><ProtectedRoute><RentalsPage /></ProtectedRoute></MainLayout>} />
      <Route path="/tracking" element={<MainLayout><ProtectedRoute><TrackingPage /></ProtectedRoute></MainLayout>} />
      
      {/* Catch all */}
      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
