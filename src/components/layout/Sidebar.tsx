import { Link, useLocation } from 'react-router-dom';
import { Car, User, Calendar, MapPin, Home, Settings, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast("You have been successfully signed out.");
    } catch (error) {
      console.error("Error signing out:", error);
      toast("Failed to sign out. Please try again.");
    }
  };

  return (
    <SidebarComponent collapsible="offcanvas" className="bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg">
      <SidebarHeader className="flex items-center justify-between px-4 h-16 border-b border-blue-500/20">
        <Link to="/" className="flex items-center gap-2">
          <Car className="h-6 w-6 text-white transition-transform hover:scale-110" />
          <span className="font-bold text-xl tracking-tight">Moretrip</span>
        </Link>
        <SidebarTrigger className="text-white hover:bg-blue-500/50 rounded-md p-1" />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={isActive("/")
                    ? "bg-blue-500/30 text-white font-semibold rounded-lg"
                    : "text-blue-100 hover:bg-blue-500/20 hover:text-white rounded-lg transition-colors"}
                >
                  <Link to="/" className="flex items-center gap-3 py-2 px-3">
                    <Home className="h-5 w-5 transition-transform hover:scale-110" />
                    <span className="text-sm">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={isActive("/vehicles")
                    ? "bg-blue-500/30 text-white font-semibold rounded-lg"
                    : "text-blue-100 hover:bg-blue-500/20 hover:text-white rounded-lg transition-colors"}
                >
                  <Link to="/vehicles" className="flex items-center gap-3 py-2 px-3">
                    <Car className="h-5 w-5 transition-transform hover:scale-110" />
                    <span className="text-sm">Vehicles</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={isActive("/drivers")
                    ? "bg-blue-500/30 text-white font-semibold rounded-lg"
                    : "text-blue-100 hover:bg-blue-500/20 hover:text-white rounded-lg transition-colors"}
                >
                  <Link to="/drivers" className="flex items-center gap-3 py-2 px-3">
                    <User className="h-5 w-5 transition-transform hover:scale-110" />
                    <span className="text-sm">Drivers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={isActive("/rentals")
                    ? "bg-blue-500/30 text-white font-semibold rounded-lg"
                    : "text-blue-100 hover:bg-blue-500/20 hover:text-white rounded-lg transition-colors"}
                >
                  <Link to="/rentals" className="flex items-center gap-3 py-2 px-3">
                    <Calendar className="h-5 w-5 transition-transform hover:scale-110" />
                    <span className="text-sm">Rentals</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={isActive("/schedule")
                    ? "bg-blue-500/30 text-white font-semibold rounded-lg"
                    : "text-blue-100 hover:bg-blue-500/20 hover:text-white rounded-lg transition-colors"}
                >
                  <Link to="/schedule" className="flex items-center gap-3 py-2 px-3">
                    <Calendar className="h-5 w-5 transition-transform hover:scale-110" />
                    <span className="text-sm">Schedule</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={isActive("/tracking")
                    ? "bg-blue-500/30 text-white font-semibold rounded-lg"
                    : "text-blue-100 hover:bg-blue-500/20 hover:text-white rounded-lg transition-colors"}
                >
                  <Link to="/tracking" className="flex items-center gap-3 py-2 px-3">
                    <MapPin className="h-5 w-5 transition-transform hover:scale-110" />
                    <span className="text-sm">GPS Tracking</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={isActive("/accounting")
                    ? "bg-blue-500/30 text-white font-semibold rounded-lg"
                    : "text-blue-100 hover:bg-blue-500/20 hover:text-white rounded-lg transition-colors"}
                >
                  <Link to="/accounting" className="flex items-center gap-3 py-2 px-3">
                    <DollarSign className="h-5 w-5 transition-transform hover:scale-110" />
                    <span className="text-sm">Income Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={isActive("/invoices")
                    ? "bg-blue-500/30 text-white font-semibold rounded-lg"
                    : "text-blue-100 hover:bg-blue-500/20 hover:text-white rounded-lg transition-colors"}
                >
                  <Link to="/invoices" className="flex items-center gap-3 py-2 px-3">
                    <FileText className="h-5 w-5 transition-transform hover:scale-110" />
                    <span className="text-sm">Invoices</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={isActive("/settings")
                    ? "bg-blue-500/30 text-white font-semibold rounded-lg"
                    : "text-blue-100 hover:bg-blue-500/20 hover:text-white rounded-lg transition-colors"}
                >
                  <Link to="/settings" className="flex items-center gap-3 py-2 px-3">
                    <Settings className="h-5 w-5 transition-transform hover:scale-110" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto border-t border-blue-500/20 pt-2">
          <SidebarGroupLabel className="text-blue-200 text-xs px-3">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center gap-3 text-red-300 hover:text-red-100 hover:bg-red-500/20 justify-start rounded-lg py-2 px-3 transition-colors"
                    onClick={handleSignOut}
                  >
                    <User className="h-5 w-5 transition-transform hover:scale-110" />
                    <span className="text-sm">Logout</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
};

export default Sidebar;