import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Map, Calendar, Heart, Compass } from "lucide-react";
import { Link } from "react-router-dom";

export const TouristDashboard = () => {
  const { user } = useContext(AuthContext);

  const stats = [
    { label: "Upcoming Trips", value: "2", icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10", link: "/dashboard/bookings" },
    { label: "Saved Places", value: "12", icon: Heart, color: "text-red-500", bg: "bg-red-500/10", link: "/dashboard/favorites" },
    { label: "AI Plans", value: "3", icon: Compass, color: "text-purple-500", bg: "bg-purple-500/10", link: "/planner" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`h-12 w-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent activity to show.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
