import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  HomeIcon,
  CarIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  CalendarClockIcon,
  SettingsIcon,
  Receipt,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";

const sidebarItems = [
  { title: "Dashboard", href: "/", icon: HomeIcon },
  { title: "Vehicles", href: "/vehicles", icon: CarIcon },
  { title: "Drivers", href: "/drivers", icon: UsersIcon },
  { title: "Rentals", href: "/rentals", icon: CalendarIcon },
  { title: "Tracking", href: "/tracking", icon: MapPinIcon },
  { title: "Schedule", href: "/schedule", icon: CalendarClockIcon },
  { title: "Incomes", href: "/accounting", icon: Receipt },
  { title: "Settings", href: "/settings", icon: SettingsIcon },
];

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const { open, setOpen } = useSidebar();
  const location = useLocation();

  // Debug toggle state
  useEffect(() => {
    console.log("Sidebar open state:", open);
  }, [open]);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setOpen(false);
  }, [location, setOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderSidebarContent = () => (
    <>
      <div className="pl-6 pr-4 pt-6 pb-4">
        <h1 className="font-bold text-white">Moretrip Rental Hub</h1>
        <p className="text-blue-100 text-sm">
          Manage your rental operations efficiently.
        </p>
      </div>

      <div className="py-4 text-sm">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 pl-6 pr-4 rounded-md transition-colors ${
                isActive
                  ? "bg-blue-600 text-white font-medium"
                  : "text-blue-100 hover:bg-blue-400 hover:text-white"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto mb-4 px-6">
        <div className="pb-3 flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.user_metadata?.avatar_url || ""}
              alt={user?.user_metadata?.full_name || "Profile"}
            />
            <AvatarFallback>
              {user?.user_metadata?.full_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {user?.user_metadata?.full_name}
            </span>
            <span className="text-xs text-blue-100">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-[280px] max-w-[90vw] border-r p-0 bg-blue-500"
        >
          <SheetHeader className="pl-6 pr-4 pt-6 pb-4">
            <SheetTitle className="text-white">Moretrip Rental Hub</SheetTitle>
            <SheetDescription className="text-blue-100">
              Manage your rental operations efficiently.
            </SheetDescription>
          </SheetHeader>
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:block w-64 shrink-0 border-r bg-blue-900 flex flex-col transition-all">
        {renderSidebarContent()}
      </aside>
    </>
  );
};

export default Sidebar;