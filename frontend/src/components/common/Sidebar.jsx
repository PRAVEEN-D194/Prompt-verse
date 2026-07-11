import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { cn } from "../../utils/cn";
import { LayoutDashboard, Compass, Map, Building, CalendarCheck, Settings, Users, Bell } from "lucide-react";

export const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const getLinks = () => {
    const baseLinks = [
      { name: "Profile", path: "/dashboard/profile", icon: Settings },
      { name: "Notifications", path: "/dashboard/notifications", icon: Bell },
    ];

    if (user.role === "tourist") {
      return [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "AI Planner", path: "/planner", icon: Compass },
        { name: "My Bookings", path: "/dashboard/bookings", icon: CalendarCheck },
        { name: "Favorites", path: "/dashboard/favorites", icon: Map },
        ...baseLinks
      ];
    }
    
    if (user.role === "hotel_owner") {
      return [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "My Hotels", path: "/dashboard/my-hotels", icon: Building },
        { name: "Bookings", path: "/dashboard/hotel-bookings", icon: CalendarCheck },
        ...baseLinks
      ];
    }
    
    if (user.role === "admin") {
      return [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Manage Users", path: "/dashboard/users", icon: Users },
        { name: "Manage Places", path: "/dashboard/manage-places", icon: Map },
        { name: "Manage Hotels", path: "/dashboard/manage-hotels", icon: Building },
        ...baseLinks
      ];
    }

    return baseLinks;
  };

  const links = getLinks();

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block border-r bg-background min-h-[calc(100vh-4rem)]">
      <div className="py-6 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
          
          return (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};
