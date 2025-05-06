import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  HomeIcon,
  CarIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  CalendarClockIcon,
  SettingsIcon,
  MenuIcon,
  Receipt,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: HomeIcon,
  },
  {
    title: "Vehicles",
    href: "/vehicles",
    icon: CarIcon,
  },
  {
    title: "Drivers",
    href: "/drivers",
    icon: UsersIcon,
  },
  {
    title: "Rentals",
    href: "/rentals",
    icon: CalendarIcon,
  },
  {
    title: "Tracking",
    href: "/tracking",
    icon: MapPinIcon,
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: CalendarClockIcon,
  },
  {
    title: "Accounting",
    href: "/accounting",
    icon: Receipt,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await signOut();
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const renderSidebarContent = () => (
    <>
      <div className="pl-6 pr-4 pt-6 pb-4">
        <h1 className="font-bold">Moretrip Rental Hub</h1>
        <p className="text-muted-foreground text-sm">
          Manage your rental operations efficiently.
        </p>
      </div>

      <div className="py-4 text-sm">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 pl-6 pr-4 rounded-md hover:bg-secondary ${
                isActive ? "bg-secondary font-medium" : "text-muted-foreground"
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
            <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={user?.user_metadata?.full_name || "Profile"} />
            <AvatarFallback>{user?.user_metadata?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.user_metadata?.full_name}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLogoutLoading}
          className="w-full py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLogoutLoading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-3/4 border-r p-0">
          <SheetHeader className="pl-6 pr-4 pt-6 pb-4">
            <SheetTitle>Moretrip Rental Hub</SheetTitle>
            <SheetDescription>
              Manage your rental operations efficiently.
            </SheetDescription>
          </SheetHeader>
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>

      <aside className="hidden md:block w-64 shrink-0 border-r flex flex-col">
        {renderSidebarContent()}
      </aside>
    </>
  );
};

export default Sidebar;
