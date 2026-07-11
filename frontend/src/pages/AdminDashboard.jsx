import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Users, Map, Building, Activity } from "lucide-react";

export const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  const stats = [
    { label: "Total Users", value: "1,245", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Tourist Places", value: "156", icon: Map, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Registered Hotels", value: "84", icon: Building, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "System Status", value: "Healthy", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Control Panel</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
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
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              User list will be displayed here.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No pending approvals for places or hotels.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
