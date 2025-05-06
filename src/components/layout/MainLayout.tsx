import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Toaster } from '@/components/ui/sonner';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Debug SidebarProvider
  useEffect(() => {
    console.log("SidebarProvider initialized, location:", location.pathname);
  }, [location]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background">
        {children}
        <Toaster />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="p-4 md:p-6 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;