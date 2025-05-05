import { Link, useLocation } from 'react-router-dom';
import { Car, User, Calendar, MapPin, Home, Settings } from 'lucide-react';
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
    <SidebarComponent collapsible="offcanvas">
      <SidebarHeader className="flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Moretrip</span>
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/vehicles") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/vehicles">
                    <Car className="h-5 w-5" />
                    <span>Vehicles</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/drivers") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/drivers">
                    <User className="h-5 w-5" />
                    <span>Drivers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/rentals") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/rentals">
                    <Calendar className="h-5 w-5" />
                    <span>Rentals</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/schedule") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/schedule">
                    <Calendar className="h-5 w-5" />
                    <span>Schedule</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/tracking") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/tracking">
                    <MapPin className="h-5 w-5" />
                    <span>GPS Tracking</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/settings") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/settings">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center gap-3 text-red-500 justify-start"
                    onClick={handleSignOut}
                  >
                    <User className="h-5 w-5" />
                    <span>Logout</span>
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