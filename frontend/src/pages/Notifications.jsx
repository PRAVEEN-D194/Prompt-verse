import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Bell, CheckCircle } from "lucide-react";
import { notificationService } from "../services/notificationService";
import { Loader } from "../components/ui/Loader";

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // If there's an API for mark all, call it here. For now, loop or just refresh.
      const unread = notifications.filter(n => !n.isRead);
      for (let n of unread) {
        await notificationService.markAsRead(n._id);
      }
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  if (loading) return <div className="pt-20"><Loader /></div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={handleMarkAllAsRead} className="text-sm text-primary hover:underline flex items-center">
          <CheckCircle className="w-4 h-4 mr-1" /> Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No notifications found.</div>
        ) : (
          notifications.map((notif) => (
            <Card key={notif._id} className={`transition-colors ${!notif.isRead ? 'bg-primary/5 border-primary/20 cursor-pointer' : ''}`} onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-full ${!notif.isRead ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Bell size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{notif.title || notif.message}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                  <span className="text-xs text-muted-foreground block mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
