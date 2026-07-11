import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Building, CalendarCheck, DollarSign, TrendingUp } from "lucide-react";

export const HotelOwnerDashboard = () => {
  const { user } = useContext(AuthContext);

  const stats = [
    { label: "My Hotels", value: "3", icon: Building, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Bookings", value: "48", icon: CalendarCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Revenue", value: "$12,450", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Occupancy Rate", value: "78%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Partner Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
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
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No recent bookings to display.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Chart data will be available soon.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
